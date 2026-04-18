const mongoose = require("mongoose");

const versionSchema = new mongoose.Schema({
  content: String,
  editedAt: { type: Date, default: Date.now },
  editNote: String,
});

const solutionSchema = new mongoose.Schema(
  {
    problem: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    versions: [versionSchema],
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    aiEvaluation: {
      feasibilityScore: Number,
      creativityScore: Number,
      effectivenessScore: Number,
      overallScore: Number,
      feedback: String,
      evaluatedAt: Date,
    },
    isWinner: { type: Boolean, default: false },
    status: { type: String, enum: ["pending", "reviewed", "winner", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Solution", solutionSchema);
