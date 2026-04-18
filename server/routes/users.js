const express = require("express");
const User     = require("../models/User");
const Problem  = require("../models/Problem");
const Solution = require("../models/Solution");
const auth     = require("../middleware/auth");
const router   = express.Router();

// GET /api/users/leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.find()
      .select("name avatar points level badges stats")
      .sort({ points: -1 })
      .limit(20);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/me/dashboard  — MUST come before /:id routes
router.get("/me/dashboard", auth, async (req, res) => {
  try {
    const user       = await User.findById(req.user._id).select("-password");
    const myProblems = await Problem.find({ postedBy: req.user._id })
      .select("title status solutionCount votes createdAt")
      .sort({ createdAt: -1 });
    const mySolutions = await Solution.find({ submittedBy: req.user._id })
      .populate("problem", "title status")
      .select("content votes aiEvaluation isWinner createdAt")
      .sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments();
    const myRank     = await User.countDocuments({ points: { $gt: user.points } }) + 1;

    const xpPerLevel      = 1000;
    const xpInCurrentLevel = user.points % xpPerLevel;

    res.json({
      user, myProblems, mySolutions,
      myRank, totalUsers,
      xpProgress: xpInCurrentLevel,
      xpNeeded: xpPerLevel,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/profile — update own profile  (before /:id to avoid conflict)
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, bio } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    await user.save();
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/:id/profile  — dynamic route LAST
router.get("/:id/profile", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const problems = await Problem.find({ postedBy: req.params.id })
      .select("title status solutionCount votes createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    const solutions = await Solution.find({ submittedBy: req.params.id })
      .populate("problem", "title")
      .select("content votes aiEvaluation isWinner createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({ user, problems, solutions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
