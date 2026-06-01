const mongoose = require("mongoose");

const rcDetail = new mongoose.Schema(
  {
    
    carDetail: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    rcNumber: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const RCDetail = mongoose.model("RCDetail", rcDetail);

module.exports = RCDetail; 