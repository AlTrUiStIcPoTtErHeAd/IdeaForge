const express = require("express");
const Solution = require("../models/Solution");
const Problem = require("../models/Problem");
const User = require("../models/User");
const auth = require("../middleware/auth");
const router = express.Router();

// GET /api/solutions/problem/:problemId
router.get("/problem/:problemId", async (req, res) => {
  try {
    const solutions = await Solution.find({ problem: req.params.problemId })
      .populate("submittedBy", "name avatar level points")
      .populate("comments.user", "name avatar")
      .sort({ "aiEvaluation.overallScore": -1, votes: -1, createdAt: -1 });
    res.json(solutions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/solutions — submit solution
router.post("/", auth, async (req, res) => {
  try {
    const { problemId, content } = req.body;
    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: "Problem not found" });
    if (problem.status === "closed" || problem.status === "solved")
      return res.status(400).json({ message: "Problem is no longer accepting solutions" });

    // Check if user already submitted
    const existing = await Solution.findOne({ problem: problemId, submittedBy: req.user._id });
    if (existing) return res.status(400).json({ message: "You already submitted a solution. Edit your existing one instead." });

    const solution = await Solution.create({
      problem: problemId,
      submittedBy: req.user._id,
      content,
      versions: [{ content, editNote: "Initial submission" }],
    });

    // Update problem stats
    await Problem.findByIdAndUpdate(problemId, {
      $inc: { solutionCount: 1, contributorCount: 1 },
    });

    // Award points to user
    req.user.points += 100;
    req.user.stats.solutionsSubmitted += 1;

    // Badge: first solution
    if (req.user.stats.solutionsSubmitted === 1) {
      req.user.badges.push({ name: "First Solver", description: "Submitted your first solution", icon: "◎" });
    }
    // Badge: 10 solutions
    if (req.user.stats.solutionsSubmitted === 10) {
      req.user.badges.push({ name: "Innovator", description: "Submitted 10 solutions", icon: "◆" });
    }

    req.user.checkLevelUp();
    await req.user.save();

    await solution.populate("submittedBy", "name avatar level points");

    // Notify problem room
    req.io.to(problemId).emit("new-solution", solution);

    res.status(201).json(solution);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/solutions/:id — edit solution (creates new version)
router.put("/:id", auth, async (req, res) => {
  try {
    const solution = await Solution.findById(req.params.id);
    if (!solution) return res.status(404).json({ message: "Not found" });
    if (solution.submittedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    // Save version history
    solution.versions.push({ content: solution.content, editNote: req.body.editNote || "Updated" });
    solution.content = req.body.content;
    solution.aiEvaluation = undefined; // Clear old AI evaluation on edit
    await solution.save();
    res.json(solution);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/solutions/:id/vote
router.post("/:id/vote", auth, async (req, res) => {
  try {
    const solution = await Solution.findById(req.params.id);
    if (!solution) return res.status(404).json({ message: "Not found" });

    const idx = solution.votes.indexOf(req.user._id);
    if (idx === -1) {
      solution.votes.push(req.user._id);
      // Award points to solution author
      await User.findByIdAndUpdate(solution.submittedBy, { $inc: { points: 10, "stats.totalVotesReceived": 1 } });
    } else {
      solution.votes.splice(idx, 1);
      await User.findByIdAndUpdate(solution.submittedBy, { $inc: { points: -10, "stats.totalVotesReceived": -1 } });
    }
    await solution.save();
    res.json({ votes: solution.votes.length, voted: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/solutions/:id/comment
router.post("/:id/comment", auth, async (req, res) => {
  try {
    const solution = await Solution.findById(req.params.id);
    if (!solution) return res.status(404).json({ message: "Not found" });
    solution.comments.push({ user: req.user._id, text: req.body.text });
    await solution.save();
    await solution.populate("comments.user", "name avatar");
    res.json(solution.comments[solution.comments.length - 1]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/solutions/:id/mark-winner
router.post("/:id/mark-winner", auth, async (req, res) => {
  try {
    const solution = await Solution.findById(req.params.id).populate("problem");
    if (!solution) return res.status(404).json({ message: "Not found" });
    if (solution.problem.postedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only problem poster can mark winner" });

    solution.isWinner = true;
    solution.status = "winner";
    await solution.save();

    await Problem.findByIdAndUpdate(solution.problem._id, { status: "solved", winnerSolution: solution._id });

    // Reward winner
    await User.findByIdAndUpdate(solution.submittedBy, {
      $inc: { points: 500, "stats.solutionsWon": 1 },
      $push: { badges: { name: "Problem Solver", description: "Solution chosen as winner", icon: "★" } },
    });

    req.io.to(solution.problem._id.toString()).emit("winner-selected", solution._id);
    res.json(solution);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
