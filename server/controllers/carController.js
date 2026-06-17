const { datacatalog } = require("googleapis/build/src/apis/datacatalog");
const Car = require("../models/car.model");
const RCDetail = require("../models/rcDetail.model");
const User = require("../models/user.model");
const { uploadImage, uploadMultipleImages } = require("../utils/Cloudnary");
const getCarDetailsFromRC = require("../utils/getCarDetailsFromRC");

async function carRegister(req, res) {
    try {
        const userId = req.user?.sub;
        const { rcNumber, onlyForCheck } = req.body;
        // console.log("detail", userId, rcNumber)
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if RC number already exists
        const checkRc = await Car.findOne({ rcNumber });
        if (checkRc) {
            if (checkRc.status === "sold") {
                return res.status(400).json({
                    success: false,
                    message: "RC number already exists and car is sold"
                });
            } else {
                return res.status(200).json({
                    success: true,
                    message: "RC number already exists",
                    data: checkRc.carDetail,
                    id: checkRc._id
                })
            }
        }

        const carDetailWithRC = await getCarDetailsFromRC(rcNumber);

        // ✅ Ye block add karo — agar koi bhi critical field null ho
        const cd = carDetailWithRC.carData;
        const hasData = cd.make || cd.model || cd.ownerName || cd.chassisNumber || cd.engineNumber;

        if (!hasData) {
            return res.status(422).json({
                success: false,
                message: "Could not fetch vehicle details for this RC number. Please verify the RC number and try again."
            });
        }

        const carData = {
            seller: userId,
            rcNumber,
            carDetail: carDetailWithRC.carData,
            onlyForCheck: onlyForCheck || false
        };

        const uploadPromises = [];

        // ✅ FIXED - rename to result
        if (req.files?.rcFrontImage) {
            uploadPromises.push(
                uploadImage(req.files.rcFrontImage[0].buffer).then((result) => {
                    carData.rcFrontImage = result;
                })
            );
        }

        if (req.files?.rcBackImage) {
            uploadPromises.push(
                uploadImage(req.files.rcBackImage[0].buffer).then((result) => {
                    carData.rcBackImage = result;
                })
            );
        }

        await Promise.all(uploadPromises);

        const car = new Car(carData);

        const existingRcDetail = await RCDetail.findOne({ rcNumber });
        if (!existingRcDetail) {
            const rcDetail = new RCDetail({
                carDetail: carDetailWithRC,
                rcNumber
            });
            await rcDetail.save();
        }

        await car.save();

        return res.status(200).json({
            success: true,
            message: "Car registered successfully",
            data: carDetailWithRC.carData
        });

    } catch (error) {
        console.log("Internal server error", error);

        const statusCode =
            error.message?.includes("Insufficient balance") ? 422 : 500;

        return res.status(statusCode).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
}

async function carDetailUpdate(req, res) {
    try {
        const userId = req.user?.sub;
        const { rcNumber } = req.params;
        const {
            kmDriven, isScrateched, isAccident,
            isRunningCondition, anyMissingPart,
            pickupAddress,
            pickupStreetAndHouse,
            pickupLatitude,
            pickupLongitude,
            pickupPlaceId,
            priceUserWant
        } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        // ── Validate required text fields ──
        const missingFields = [];
        if (kmDriven === undefined || kmDriven === null || kmDriven === "") missingFields.push("kmDriven");
        if (isScrateched === undefined || isScrateched === null || isScrateched === "") missingFields.push("isScrateched");
        if (isAccident === undefined || isAccident === null || isAccident === "") missingFields.push("isAccident");
        if (isRunningCondition === undefined || isRunningCondition === null || isRunningCondition === "") missingFields.push("isRunningCondition");
        if (anyMissingPart === undefined || anyMissingPart === null || anyMissingPart === "") missingFields.push("anyMissingPart");
        if (!pickupAddress) missingFields.push("pickupAddress");
        if (!pickupStreetAndHouse) missingFields.push("pickupStreetAndHouse");
        if (!pickupLatitude) missingFields.push("pickupLatitude");
        if (!pickupLongitude) missingFields.push("pickupLongitude");
        if (!pickupPlaceId) missingFields.push("pickupPlaceId");
        if (priceUserWant === undefined || priceUserWant === null || priceUserWant === "") missingFields.push("priceUserWant");

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(", ")}`,
            });
        }

        // ── Validate required image fields ──
        const requiredImages = [
            "frontImage", "backImage", "chassisImage",
            "engineImage", "tyreImage", "odometerImage",
        ];
        const missingImages = requiredImages.filter(field => !req.files?.[field]);

        if (missingImages.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required images: ${missingImages.join(", ")}`,
            });
        }

        const carDetail = await Car.findOne({ rcNumber });
        if (!carDetail) {
            return res.status(404).json({ success: false, message: "Car not found" });
        }

        await Promise.all(
            requiredImages.map(async (field) => {
                const uploaded = await uploadImage(req.files[field][0].buffer);
                carDetail[field] = {
                    image: uploaded.image,
                    public_id: uploaded.public_id,
                };
            })
        );

        carDetail.kmDriven = kmDriven;
        carDetail.isScrateched = isScrateched;
        carDetail.isAccident = isAccident;
        carDetail.isRunningCondition = isRunningCondition;
        carDetail.anyMissingPart = anyMissingPart;
        carDetail.priceUserWant = priceUserWant;

        carDetail.pickupLocation = {
            address: pickupAddress,
            streetAndHouse: pickupStreetAndHouse,
            latitude: parseFloat(pickupLatitude),
            longitude: parseFloat(pickupLongitude),
            placeId: pickupPlaceId,
        };

        await carDetail.save();

        return res.status(200).json({
            success: true,
            message: "Car details updated successfully",
            data: carDetail,
        });
    } catch (error) {
        console.log("Internal server error", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

async function approveForCarSale(req, res) {
    try {
        const userId = req.user?.sub;
        const { rcNumber } = req.params;
        const { price } = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const carDetail = await Car.findOne({ rcNumber });
        if (!carDetail) {
            return res.status(404).json({
                success: false,
                message: "Car not found"
            });
        }

        carDetail.status = "processing";
        carDetail.price = price; // ✅ Price set karo
        await carDetail.save();

        return res.status(200).json({
            success: true,
            message: "Car approved for sale successfully",
            data: carDetail
        })

    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

async function fetchCarDetailForMe(req, res) {
    try {
        const userId = req.user?.sub;
        const role = req.user?.role;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        let carDetails;

        if (role === "user") {
            carDetails = await Car.find({
                seller: userId,
                onlyForCheck: false
            })
                .populate("craneMan")
                .populate("seller");
        } else {
            carDetails = await Car.find({
                craneMan: userId,
                craneManAssignStatus: "accepted",
                onlyForCheck: false
            })
                .populate("craneMan")
                .populate("seller");
        }

        return res.status(200).json({
            success: true,
            message: "Car details fetched successfully",
            data: carDetails
        });

    } catch (error) {
        console.error("Internal server error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

async function fetchCarDetailById(req, res) {
    try {
        const userId = req.user?.sub;
        const { carId } = req.params;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        let isUser
        console.log("req.user?.role", req.user?.role)
        if (req.user?.role === "user") {
            isUser = true;
        }
        const carDetail = await Car.findById(carId).populate("craneMan").populate("seller");
        if (!carDetail) {
            return res.status(404).json({
                success: false,
                message: "Car not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Car detail fetched successfully",
            data: carDetail,
            isUser
        })
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

async function testRcDetail(req, res) {
    try {
        const { rcNumber } = req.params;
        const carDetailWithRC = await getCarDetailsFromRC(rcNumber);
        return res.status(200).json({
            success: true,
            message: "Car details fetched successfully",
            data: carDetailWithRC
        });
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

async function UpdateAssignedToCraneManStatus(req, res) {
    try {
        const userId = req.user?.sub;
        const { carId } = req.params;
        const { status } = req.body;
        console.log("status", status)
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const carDetail = await Car.findById(carId);
        if (!carDetail) {
            return res.status(404).json({
                success: false,
                message: "Car not found"
            });
        }

        carDetail.craneManAssignStatus = status;
        await carDetail.save();
        return res.status(200).json({
            success: true,
            message: "Car assigned to crane man successfully",
            data: carDetail
        })
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

async function priceAcceptedByUser(req, res) {
    try {
        const userId = req.user?.sub;
        const { carId } = req.params;
        const { userAgreedForPrice } = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const carDetail = await Car.findById(carId);
        if (!carDetail) {
            return res.status(404).json({
                success: false,
                message: "Car not found"
            });
        }

        carDetail.userAgreedForPrice = userAgreedForPrice;
        await carDetail.save();
        return res.status(200).json({
            success: true,
            message: "Car assigned to crane man successfully",
            data: carDetail
        })
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

module.exports = {
    carRegister,
    carDetailUpdate,
    approveForCarSale,
    fetchCarDetailForMe,
    fetchCarDetailById,
    testRcDetail,
    UpdateAssignedToCraneManStatus,
    priceAcceptedByUser
};