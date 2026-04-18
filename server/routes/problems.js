const express = require("express");
const Problem = require("../models/Problem");
const Solution = require("../models/Solution");
const auth = require("../middleware/auth");
const router = express.Router();

// GET /api/problems — list with search, filter, pagination
router.get("/", async (req, res) => {
  try {
    const { search, category, status, difficulty, sort = "createdAt", page = 1, limit = 12 } = req.query;
    const query = {};
    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (status) query.status = status;
    if (difficulty) query.difficulty = difficulty;

    const sortMap = {
      newest: { createdAt: -1 },
      popular: { "votes": -1 },
      deadline: { deadline: 1 },
      solutions: { solutionCount: -1 },
    };

    const problems = await Problem.find(query)
      .populate("postedBy", "name avatar level")
      .sort(sortMap[sort] || { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Problem.countDocuments(query);
    res.json({ problems, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/problems/stats — public platform stats
router.get("/stats", async (req, res) => {
  try {
    const problems = await Problem.countDocuments();
    const solutions = await Solution.countDocuments();
    // Unique contributors (users who have submitted at least one solution)
    const contributors = (await Solution.distinct("submittedBy")).length;
    res.json({ problems, solutions, contributors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/problems/:id
router.get("/:id", async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("postedBy", "name avatar level points");
    if (!problem) return res.status(404).json({ message: "Problem not found" });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/problems — create
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, constraints, expectedOutcome, deadline, category, tags, difficulty } = req.body;
    const problem = await Problem.create({
      title, description, constraints, expectedOutcome,
      deadline, category, tags, difficulty,
      postedBy: req.user._id,
    });
    await problem.populate("postedBy", "name avatar level");

    // Award points
    req.user.points += 50;
    req.user.stats.problemsPosted += 1;
    req.user.checkLevelUp();
    await req.user.save();

    req.io.emit("new-problem", problem);
    res.status(201).json(problem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/problems/:id
router.put("/:id", auth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: "Not found" });
    if (problem.postedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const allowed = ["title","description","constraints","expectedOutcome","deadline","category","tags","difficulty","status"];
    allowed.forEach(f => { if (req.body[f] !== undefined) problem[f] = req.body[f]; });
    await problem.save();
    res.json(problem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/problems/:id/vote
router.post("/:id/vote", auth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: "Not found" });

    const idx = problem.votes.indexOf(req.user._id);
    if (idx === -1) {
      problem.votes.push(req.user._id);
    } else {
      problem.votes.splice(idx, 1);
    }
    await problem.save();
    res.json({ votes: problem.votes.length, voted: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/problems/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: "Not found" });
    if (problem.postedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });
    await problem.deleteOne();
    await Solution.deleteMany({ problem: req.params.id });
    res.json({ message: "Problem deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
