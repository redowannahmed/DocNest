const mongoose = require("mongoose");

const pinnedConditionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  severity: { type: String, required: true },
  icon: String
}, { timestamps: true });

module.exports = mongoose.model("PinnedCondition", pinnedConditionSchema);
