const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    constraints: { type: String, default: "" },
    expectedOutcome: { type: String, required: true },
    deadline: { type: Date },
    category: {
      type: String,
      enum: ["Tech", "Environment", "Health", "Education", "Social", "Business", "Other"],
      required: true,
    },
    tags: [{ type: String }],
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
    status: { type: String, enum: ["open", "in-review", "solved", "closed"], default: "open" },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    solutionCount: { type: Number, default: 0 },
    contributorCount: { type: Number, default: 0 },
    aiAnalysis: {
      clarityScore: Number,
      suggestedTags: [String],
      keyConstraints: [String],
      improvementSuggestions: [String],
      analyzedAt: Date,
    },
    winnerSolution: { type: mongoose.Schema.Types.ObjectId, ref: "Solution" },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

problemSchema.index({ title: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Problem", problemSchema);
