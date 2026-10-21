const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        email: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
        },
        password: {
            type: String,
            minlength: 6,
            select: false, // by default password result me nahi aayega
        },
        role: {
            type: String,
            enum: ["user", "admin", "craneMan"],
            default: "user",
        },
        otp: {
            type: Number,
        },
        otpExpiry: {
            type: Date,
        },
        isPhoneVerified: {
            type: Boolean,
            default: false,
        },
        userImage: {
            img: {
                type: String
            },
            public_id: {
                type: String
            }
        },

        bankDetails: {
            accountNumber: { type: String },
            ifscCode: { type: String },
            bankName: { type: String },
            accountHolderName: { type: String },
        },

        upiDetails: {
            upiId: { type: String }
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        fcmToken: {
            type: String
        },
        location: {
            latitude: Number,
            longitude: Number,
            timestamp: Date
        }
    },
    {
        timestamps: true,
    }
);

// ✅ password hash before save
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ✅ instance method for password compare
userSchema.methods.comparePassword = async function (plainPassword) {
    // console.log('Candidate password type:', typeof plainPassword);
    // console.log('Stored password type:', typeof this.password);
    // console.log('Candidate password:', plainPassword ? 'exists' : 'missing');
    // console.log('Stored password:', this.password ? 'exists' : 'missing');
    return await bcrypt.compare(plainPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
