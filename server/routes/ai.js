const express = require("express");
const https   = require("https");
const Problem  = require("../models/Problem");
const Solution = require("../models/Solution");
const auth     = require("../middleware/auth");
const router   = express.Router();

// ─────────────────────────────────────────────
// Core Groq API helper  (OpenAI-compatible)
// Groq keys start with "gsk_"
// Docs: https://console.groq.com/docs/openai
// ─────────────────────────────────────────────
async function askGroq(prompt, maxTokens = 1000) {
  const apiKey = process.env.GROQ_API_KEY;
  const model  = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  if (!apiKey || apiKey.startsWith("gsk_your")) {
    throw new Error(
      "GROQ_API_KEY is not set. Add your Groq key (starts with gsk_) to server/.env"
    );
  }

  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.7,
    });

    const options = {
      hostname: "api.groq.com",
      path:     "/openai/v1/chat/completions",
      method:   "POST",
      headers: {
        "Content-Type":   "application/json",
        "Content-Length": Buffer.byteLength(payload),
        Authorization:    `Bearer ${apiKey}`,
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(body);

          if (res.statusCode === 401) {
            reject(new Error(
              "Invalid Groq API key. Get yours at https://console.groq.com and set GROQ_API_KEY in server/.env"
            ));
            return;
          }

          if (res.statusCode === 404) {
            reject(new Error(
              `Model '${model}' not found. Try GROQ_MODEL=llama-3.3-70b-versatile in server/.env`
            ));
            return;
          }

          if (res.statusCode === 429) {
            reject(new Error("Groq API rate limit reached. Please wait and try again."));
            return;
          }

          const content = parsed?.choices?.[0]?.message?.content;

          if (res.statusCode >= 200 && res.statusCode < 300 && content) {
            resolve(content);
            return;
          }

          const apiMessage =
            parsed?.error?.message ||
            parsed?.message ||
            `Unexpected status ${res.statusCode}: ${body.slice(0, 300)}`;
          reject(new Error(`Groq API error: ${apiMessage}`));
        } catch (err) {
          reject(new Error(
            `Failed to parse Groq response: ${err.message}. Raw: ${body.slice(0, 200)}`
          ));
        }
      });
    });

    req.on("error", (err) =>
      reject(new Error(`Network error calling Groq: ${err.message}`))
    );
    req.write(payload);
    req.end();
  });
}

// ─────────────────────────────────────────────
// JSON extraction helpers
// ─────────────────────────────────────────────
function extractJson(text) {
  const cleaned = (text || "")
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const objMatch = cleaned.match(/\{[\s\S]*\}/);
    const arrMatch = cleaned.match(/\[[\s\S]*\]/);
    if (objMatch) return JSON.parse(objMatch[0]);
    if (arrMatch) return JSON.parse(arrMatch[0]);
    throw new Error("Could not extract valid JSON from AI response");
  }
}

function extractJsonArray(text) {
  const cleaned = (text || "")
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
  try {
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    const start = cleaned.indexOf("[");
    const end   = cleaned.lastIndexOf("]");
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error("Failed to parse ranking JSON array from AI response");
  }
}

function buildFallbackRankings(solutions) {
  return solutions
    .map((s, index) => {
      const voteCount     = Array.isArray(s.votes) ? s.votes.length : 0;
      const contentLen    = (s.content || "").trim().length;
      const feasibility   = Math.min(10, Math.max(1, 5 + Math.floor(voteCount / 2)));
      const creativity    = Math.min(10, Math.max(1, 4 + Math.floor(contentLen / 250)));
      const effectiveness = Math.min(10, Math.max(1, 5 + Math.floor(voteCount / 3)));
      const overall       = Math.round((feasibility + creativity + effectiveness) / 3);
      return {
        index, feasibility, creativity, effectiveness, overall,
        feedback: "Fallback ranking used because AI response was unavailable.",
      };
    })
    .sort((a, b) => b.overall - a.overall);
}

// ─────────────────────────────────────────────
// GET /api/ai/health  ← NO auth required
// Tests if the Groq API key works correctly
// ─────────────────────────────────────────────
router.get("/health", async (_req, res) => {
  const apiKey = process.env.GROQ_API_KEY;
  const model  = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  if (!apiKey || apiKey.startsWith("gsk_your")) {
    return res.status(400).json({
      ok: false,
      message: "GROQ_API_KEY is not configured. Add it to server/.env",
      hint: "Get your key from https://console.groq.com — it starts with 'gsk_'",
    });
  }

  try {
    const reply = await askGroq("Respond with exactly 2 words: AI Ready", 20);
    res.json({ ok: true, model, reply: reply.trim(), provider: "Groq" });
  } catch (err) {
    res.status(500).json({ ok: false, model, provider: "Groq", error: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/ai/analyze-problem
// ─────────────────────────────────────────────
router.post("/analyze-problem", auth, async (req, res) => {
  try {
    const { title, description, expectedOutcome, constraints } = req.body;

    if (!description?.trim()) {
      return res.status(400).json({ message: "Problem description is required" });
    }

    const prompt = `You are an expert innovation consultant evaluating a crowd-sourced problem submission.

Problem Title: ${title || "Untitled"}
Description: ${description}
Expected Outcome: ${expectedOutcome || "Not specified"}
Constraints: ${constraints || "None specified"}

Respond ONLY with valid JSON (no markdown, no explanation outside JSON):
{
  "clarityScore": <1-10>,
  "clarityReason": "<one sentence>",
  "difficulty": "<Easy|Medium|Hard>",
  "difficultyReason": "<one sentence>",
  "suggestedTags": ["tag1","tag2","tag3","tag4"],
  "keyConstraints": ["constraint1","constraint2","constraint3"],
  "improvementSuggestions": ["suggestion1","suggestion2"],
  "promisingDirection": "<one sentence on best solution approach>"
}`;

    const text = await askGroq(prompt);
    const json = extractJson(text);

    if (req.body.problemId) {
      await Problem.findByIdAndUpdate(req.body.problemId, {
        aiAnalysis: { ...json, analyzedAt: new Date() },
      });
    }

    res.json(json);
  } catch (err) {
    console.error("[AI] analyze-problem:", err.message);
    res.status(500).json({ message: "AI analysis failed", error: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/ai/generate-ideas
// ─────────────────────────────────────────────
router.post("/generate-ideas", auth, async (req, res) => {
  try {
    const { problemId, title, description, outcome } = req.body;

    let problemTitle   = title;
    let problemDesc    = description;
    let problemOutcome = outcome;

    if (problemId) {
      const p = await Problem.findById(problemId);
      if (p) {
        problemTitle   = p.title;
        problemDesc    = p.description;
        problemOutcome = p.expectedOutcome;
      }
    }

    if (!problemDesc?.trim()) {
      return res.status(400).json({ message: "Problem description is required" });
    }

    const prompt = `You are a world-class innovation consultant. Generate 3 highly creative, distinct solution ideas.

Problem Title: ${problemTitle || "Untitled"}
Description: ${problemDesc}
Goal: ${problemOutcome || "Solve the problem effectively"}

Respond ONLY with valid JSON (no markdown):
{
  "ideas": [
    {
      "name": "<catchy solution name>",
      "tagline": "<one sentence pitch>",
      "approach": "<2-3 sentences describing the core mechanism>",
      "steps": ["step1", "step2", "step3"],
      "challenge": "<main challenge to overcome>",
      "impact": "<expected impact>"
    }
  ]
}`;

    const text = await askGroq(prompt, 1500);
    const json = extractJson(text);
    res.json(json);
  } catch (err) {
    console.error("[AI] generate-ideas:", err.message);
    res.status(500).json({ message: "Idea generation failed", error: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/ai/rank-solutions
// ─────────────────────────────────────────────
router.post("/rank-solutions", auth, async (req, res) => {
  try {
    const { problemId } = req.body;

    if (!problemId) {
      return res.status(400).json({ message: "problemId is required" });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    const solutions = await Solution.find({ problem: problemId }).populate("submittedBy", "name");
    if (solutions.length === 0) return res.json({ rankings: [], solutions: [] });

    const prompt = `You are an expert evaluator for a crowd-sourced problem-solving platform.

Problem: ${problem.title}
Description: ${problem.description}
Goal: ${problem.expectedOutcome}

Solutions to evaluate:
${solutions.map((s, i) => `[${i}] ${s.content}`).join("\n\n")}

Score each solution 1-10 on feasibility, creativity, and effectiveness. overall = average of the three.
Respond ONLY with a valid JSON array (no markdown):
[{"index":0,"feasibility":8,"creativity":7,"effectiveness":9,"overall":8,"feedback":"<10-15 word specific feedback>"}]`;

    let rankings;
    let usedFallback = false;

    try {
      const text = await askGroq(prompt, 2000);
      rankings = extractJsonArray(text);
    } catch (err) {
      usedFallback = true;
      rankings = buildFallbackRankings(solutions);
      console.warn("[AI] rank-solutions fallback:", err.message);
    }

    for (const r of rankings) {
      if (solutions[r.index]) {
        solutions[r.index].aiEvaluation = {
          feasibilityScore:   r.feasibility,
          creativityScore:    r.creativity,
          effectivenessScore: r.effectiveness,
          overallScore:       r.overall,
          feedback:           r.feedback,
          evaluatedAt:        new Date(),
        };
        await solutions[r.index].save();
      }
    }

    res.json({
      rankings,
      usedFallback,
      solutions: solutions.map((s, i) => ({
        _id: s._id,
        ...rankings.find((r) => r.index === i),
      })),
    });
  } catch (err) {
    console.error("[AI] rank-solutions:", err.message);
    res.status(500).json({ message: "Ranking failed", error: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/ai/evaluate-solution
// ─────────────────────────────────────────────
router.post("/evaluate-solution", auth, async (req, res) => {
  try {
    const { content, problemContext } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: "Solution content is required" });
    }

    const prompt = `Evaluate this solution for a crowd-sourced problem-solving platform.
${problemContext ? `Problem context: ${problemContext}` : ""}

Solution: ${content}

Respond ONLY with valid JSON (no markdown):
{
  "feasibility": <1-10>,
  "creativity": <1-10>,
  "effectiveness": <1-10>,
  "overall": <1-10>,
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "enhancement": "<one specific actionable enhancement suggestion>"
}`;

    const text = await askGroq(prompt);
    const json = extractJson(text);
    res.json(json);
  } catch (err) {
    console.error("[AI] evaluate-solution:", err.message);
    res.status(500).json({ message: "Evaluation failed", error: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/ai/boost-idea
// ─────────────────────────────────────────────
router.post("/boost-idea", auth, async (req, res) => {
  try {
    const { idea, problemContext } = req.body;

    if (!idea?.trim()) {
      return res.status(400).json({ message: "Idea description is required" });
    }

    const prompt = `Expand this rough idea into a structured, detailed solution.
${problemContext ? `Problem context: ${problemContext}` : ""}

Rough idea: ${idea}

Respond ONLY with valid JSON (no markdown):
{
  "refinedName": "<catchy solution name>",
  "coreMechanism": "<2-3 sentences>",
  "implementationSteps": ["step1","step2","step3","step4"],
  "expectedImpact": "<specific measurable impact>",
  "resourcesNeeded": ["resource1","resource2","resource3"],
  "timelineEstimate": "<rough timeline>",
  "potentialPartners": ["partner type 1","partner type 2"]
}`;

    const text = await askGroq(prompt);
    const json = extractJson(text);
    res.json(json);
  } catch (err) {
    console.error("[AI] boost-idea:", err.message);
    res.status(500).json({ message: "Boost failed", error: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/ai/match-experts
// ─────────────────────────────────────────────
router.post("/match-experts", auth, async (req, res) => {
  try {
    const { problemDescription } = req.body;

    if (!problemDescription?.trim()) {
      return res.status(400).json({ message: "Problem description is required" });
    }

    const prompt = `Identify the expert profiles most needed to solve this problem:

Problem: ${problemDescription}

Respond ONLY with valid JSON (no markdown):
{
  "experts": [
    {"role":"<expert role>","skills":["skill1","skill2"],"whyNeeded":"<one sentence>"}
  ],
  "idealTeamSize": <number>,
  "keyQuestions": ["question1","question2","question3"],
  "domainKnowledge": ["knowledge1","knowledge2","knowledge3"]
}
Include exactly 4 expert roles.`;

    const text = await askGroq(prompt);
    const json = extractJson(text);
    res.json(json);
  } catch (err) {
    console.error("[AI] match-experts:", err.message);
    res.status(500).json({ message: "Matching failed", error: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/ai/smart-search
// ─────────────────────────────────────────────
router.post("/smart-search", auth, async (req, res) => {
  try {
    const { query } = req.body;

    if (!query?.trim()) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const problems = await Problem.find({ status: "open" })
      .select("title description category tags")
      .limit(50);

    if (problems.length === 0) return res.json([]);

    const prompt = `Given this search query: "${query}"
Here are available problems (JSON): ${JSON.stringify(
      problems.map((p) => ({ id: p._id, title: p.title, category: p.category, tags: p.tags }))
    )}
Return the IDs of the top 5 most relevant problems as a JSON array: ["id1","id2",...]. No markdown, no explanation.`;

    const text    = await askGroq(prompt, 300);
    const ids     = extractJsonArray(text);
    const results = await Problem.find({ _id: { $in: ids } }).populate("postedBy", "name");
    res.json(results);
  } catch (err) {
    console.error("[AI] smart-search:", err.message);
    res.status(500).json({ message: "Smart search failed", error: err.message });
  }
});

module.exports = router;
