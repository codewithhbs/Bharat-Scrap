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
            return res.status(200).json({
                success: true,
                message: "RC number already exists",
                data: checkRc.carDetail
            })
            // return res.status(400).json({
            //     success: false,
            //     message: "RC number already exists"
            // });
        }

        // const carDetailWithRC = await getCarDetailsFromRC(rcNumber);
        // console.log("carDetailWithRC", carDetailWithRC)

        // ============== DUMMY DATA FOR NOW ==============
        const carDetailWithRC = {
            rcNumber: rcNumber,
            registrationDate: "2022-05-15",
            ownerName: "Amit Sharma",
            fatherName: "Rajesh Sharma",
            address: "Flat No. 402, Green Park, New Delhi - 110016",
            vehicleClass: "LMV",
            fuelType: "Petrol",
            make: "Hyundai",
            model: "Creta",
            manufacturingYear: 2022,
            chassisNumber: "MAH12345678901234",
            engineNumber: "G4FC123456789",
            color: "Pearl White",
            seatingCapacity: 5,
            standingCapacity: 0,
            unladenWeight: 1400,
            grossVehicleWeight: 1850,
            bodyType: "SUV",
            registrationValidity: "2032-05-14",
            insuranceValidity: "2027-05-14",
            pollutionValidity: "2026-12-31",
            status: "Active",
            rtoOffice: "New Delhi - Rohini (DL-13)",
            vehicleCategory: "Private"
        };
        // ================================================

        const carData = {
            seller: userId,
            rcNumber,
            carDetail: carDetailWithRC,
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

        const rcDetail = new RCDetail({
            carDetail: carDetailWithRC
        });

        const car = new Car(carData);

        await rcDetail.save();
        await car.save();

        return res.status(200).json({
            success: true,
            message: "Car registered successfully",
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

async function carDetailUpdate(req, res) {
    try {
        const userId = req.user?.sub;
        const { rcNumber } = req.params;
        const { kmDriven, isScrateched, isAccident, isRunningCondition, anyMissingPart, pickupLocation } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const carDetail = await Car.findOne({ rcNumber });
        if (!carDetail) {
            return res.status(404).json({
                success: false,
                message: "Car not found",
            });
        }

        const fileFields = [
            "frontImage",
            "backImage",
            "chassisImage",
            "engineImage",
            "tyreImage",
            "odometerImage",
        ];

        await Promise.all(
            fileFields.map(async (field) => {
                if (req.files?.[field]) {
                    const uploaded = await uploadImage(req.files[field][0].buffer);

                    carDetail[field] = {
                        image: uploaded.image,
                        public_id: uploaded.public_id,
                    };
                }
            })
        );

        // 🔥 Other fields
        carDetail.kmDriven = kmDriven;
        carDetail.isScrateched = isScrateched;
        carDetail.isAccident = isAccident;
        carDetail.isRunningCondition = isRunningCondition;
        carDetail.anyMissingPart = anyMissingPart;
        carDetail.pickupLocation = pickupLocation;
        
        await carDetail.save();

        return res.status(200).json({
            success: true,
            message: "Car details updated successfully",
            data: carDetail,
        });
    } catch (error) {
        console.log("Internal server error", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
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

        // const carDetails = await Car.find({ seller: userId });

        // const filterForSell = carDetails.filter(car => car.onlyForCheck === false);

        let carDetails;
        if (role === "user") {
            carDetails = await Car.find({ seller: userId }).populate("craneMan").populate("seller");
        } else {
            carDetails = await Car.find({ craneMan: userId }).populate("craneMan").populate("seller");
        }

        const filterForSell = carDetails.filter(car => car.onlyForCheck === false);

        return res.status(200).json({
            success: true,
            message: "Car details fetched successfully",
            data: filterForSell
        })
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
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
        console.log("req.user?.role",req.user?.role)
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

module.exports = {
    carRegister,
    carDetailUpdate,
    approveForCarSale,
    fetchCarDetailForMe,
    fetchCarDetailById
};