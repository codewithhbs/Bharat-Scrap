const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    message: {
      type: String,
    },
    brand: {
      type: String,
    },
    model: {
      type: String,
    },
    year: {
      type: String,
    },
    fuelType: {
      type: String,
    },
    city: {
      type: String,
    },
    isQuote: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;