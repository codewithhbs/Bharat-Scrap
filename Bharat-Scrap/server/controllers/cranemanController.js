const { datacatalog } = require("googleapis/build/src/apis/datacatalog");
const Car = require("../models/car.model");
const RCDetail = require("../models/rcDetail.model");
const User = require("../models/user.model");
const { uploadImage, uploadMultipleImages } = require("../utils/Cloudnary");
const getCarDetailsFromRC = require("../utils/getCarDetailsFromRC");

async function changeStatus(req, res) {
    // console.log("i am hit")
    try {
        const { jobId } = req.params;
        const { status } = req.body;
        // console.log("Changing job status", jobId, status);
        const job = await Car.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            })
        }
        job.status = status;
        await job.save();
        return res.status(200).json({
            success: true,
            message: "Job status updated successfully",
            data: job
        })
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

async function updateInspectionDetails(req, res) {
    try {
        const userId = req.user?.sub;
        const { jobId } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const carDetail = await Car.findById(jobId);
        if (!carDetail) {
            return res.status(404).json({
                success: false,
                message: "Car not found"
            });
        }

        let images = [];

        if (req.files && req.files.length > 0) {
            const fileBuffers = req.files.map((file) => file.buffer);
            const { successful } = await uploadMultipleImages(fileBuffers, {
                parallel: true,
                folder: "cars",
            });
            images = successful.map((r) => ({
                image: r.image,
                public_id: r.public_id,
            }));
        }

        carDetail.images = images;
        await carDetail.save();

        return res.status(200).json({
            success: true,
            message: "Inspection details updated successfully",
            data: carDetail,
        });

    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

async function paymentDetailsUpdate(req, res) {
    try {
        const userId = req.user?.sub;
        const { jobId } = req.params;
        const { paymentMethod, upiId, accountNumber, ifscCode, bankName, accountHolderName } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const carDetail = await Car.findById(jobId);
        if (!carDetail) {
            return res.status(404).json({
                success: false,
                message: "Car not found"
            });
        }

        carDetail.paymentMethod = paymentMethod;
        carDetail.paymentDetails.upiId = upiId;
        carDetail.paymentDetails.accountNumber = accountNumber;
        carDetail.paymentDetails.ifscCode = ifscCode;
        carDetail.paymentDetails.bankName = bankName;
        carDetail.paymentDetails.accountHolderName = accountHolderName;
        // carDetail.isPaid = true;

        const id = carDetail?.seller?._id || carDetail?.seller;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        user.upiDetails.upiId = upiId;
        user.bankDetails.accountNumber = accountNumber;
        user.bankDetails.ifscCode = ifscCode;
        user.bankDetails.bankName = bankName;
        user.bankDetails.accountHolderName = accountHolderName;
        
        await user.save();
        await carDetail.save();

        return res.status(200).json({
            success: true,
            message: "Payment details updated successfully",
            data: carDetail,
        });
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

module.exports = {
    changeStatus,
    updateInspectionDetails,
    paymentDetailsUpdate
};