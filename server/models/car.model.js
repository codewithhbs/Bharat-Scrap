const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    // 🔗 Seller reference
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    craneMan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    rcNumber: {
      type: String,
      required: true,
      unique: true,
    },

    rcFrontImage: {
      image: { type: String },
      public_id: { type: String },
    },

    rcBackImage: {
      image: { type: String },
      public_id: { type: String },
    },

    carDetail: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    // Car schema me
    pickupLocation: {
      address: { type: String },      // Full formatted address from Google
      streetAndHouse: { type: String },    // User-entered house no + street
      latitude: { type: Number },
      longitude: { type: Number },
      placeId: { type: String },      // Optional - Google place ID
    },

    frontImage: {
      image: { type: String },
      public_id: { type: String },
    },

    backImage: {
      image: { type: String },
      public_id: { type: String },
    },

    chassisImage: {
      image: { type: String },
      public_id: { type: String },
    },

    engineImage: {
      image: { type: String },
      public_id: { type: String },
    },

    tyreImage: {
      image: { type: String },
      public_id: { type: String },
    },

    odometerImage: {
      image: { type: String },
      public_id: { type: String },
    },

    // 🖼️ Car Images Array (max 5) 
    images: {
      type: [{
        image: { type: String },
        public_id: { type: String },
      },],
      validate: { validator: function (arr) { return arr.length <= 5; }, message: "Maximum 5 images hi upload kar sakte ho", }, default: [],
    },

    inseptionDate: {
      type: Date,
    },

    price: {
      type: Number,
    },

    paymentMethod: {
      type: String,
      enum: ["upi", "bank_transfer"],
      default: "upi",
    },

    paymentDetails: {
      upiId: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
      bankName: { type: String },
      accountHolderName: { type: String },
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    paymentTransactionId: {
      type: String,
    },

    // 📊 Car Details
    kmDriven: {
      type: Number,
    },

    onlyForCheck: {
      type: Boolean,
      default: false,
    },

    isRunningCondition: {
      type: Boolean,
      default: true,
    },

    anyMissingPart: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["pending", "processing", "en_route", "inspecting", "en_route_to_garage", "at_garage", "picked_up", "completed", "sold"],
      default: "pending",
    }
  },
  {
    timestamps: true,
  }
);

const Car = mongoose.model("Car", carSchema);

module.exports = Car;