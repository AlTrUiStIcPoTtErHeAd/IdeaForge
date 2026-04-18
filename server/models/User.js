const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["poster", "contributor", "both"], default: "both" },
    bio: { type: String, default: "" },
    points: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [
      {
        name: String,
        description: String,
        icon: String,
        earnedAt: { type: Date, default: Date.now },
      },
    ],
    stats: {
      problemsPosted: { type: Number, default: 0 },
      solutionsSubmitted: { type: Number, default: 0 },
      solutionsWon: { type: Number, default: 0 },
      totalVotesReceived: { type: Number, default: 0 },
    },
    avatar: { type: String, default: "" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.checkLevelUp = function () {
  const xpPerLevel = 1000;
  const newLevel = Math.floor(this.points / xpPerLevel) + 1;
  if (newLevel > this.level) { this.level = newLevel; return true; }
  return false;
};

module.exports = mongoose.model("User", userSchema);
