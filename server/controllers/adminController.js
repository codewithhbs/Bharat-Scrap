const User = require("../models/user.model");
const { signAccessToken, signRefreshToken } = require("../utils/jwtUtil");
const Car = require("../models/car.model");
const RCDetail = require("../models/rcDetail.model");
const Contact = require("../models/contact.model");

// admin login 
async function adminLogin(req, res) {
    try {
        const { email, password } = req.body;
        console.log("body", email)

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "email and password are required",
            });
        }

        // password field by default select: false hai, isliye +password
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        if (user.role !== "admin") {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Wrong password",
            });
        }

        const safeUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            userName: user.userName,
        };

        const accessToken = signAccessToken(safeUser);
        const { token: refreshToken, jti } = await signRefreshToken(user._id);

        res.status(201).json({
            success: true,
            user: safeUser,
            accessToken,
            refreshToken,
            sessionId: jti,
        })
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ success: false, message: "Server error during login" });
    }
}


// user controller 

async function getAllUsers(req, res) {
    try {
        const {
            search    = "",
            isBlocked = "",
            page      = 1,
            limit     = 10,
        } = req.query;

        // ── Build filter ──────────────────────────────────────────
        const filter = { role: "user" };

        // isBlocked
        if (isBlocked === "true")  filter.isBlocked = true;
        if (isBlocked === "false") filter.isBlocked = false;

        // search — name, email, phone, address
        if (search.trim()) {
            filter.$or = [
                { name:    { $regex: search.trim(), $options: "i" } },
                { email:   { $regex: search.trim(), $options: "i" } },
                { phone:   { $regex: search.trim(), $options: "i" } },
                { address: { $regex: search.trim(), $options: "i" } },
            ];
        }

        // ── Pagination ────────────────────────────────────────────
        const pageNum  = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip     = (pageNum - 1) * limitNum;

        // ── Query ─────────────────────────────────────────────────
        const [users, total] = await Promise.all([
            User.find(filter)
                .select("-otp -otpExpiry -__v")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            User.countDocuments(filter),
        ]);

        return res.status(200).json({
            success:    true,
            message:    "Users retrieved successfully",
            data:       users,
            total,
            page:       pageNum,
            limit:      limitNum,
            totalPages: Math.ceil(total / limitNum),
        });

    } catch (error) {
        console.log("Internal server error", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error:   error.message,
        });
    }
}

async function getUserById(req, res) {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "User retrieved successfully",
            data: user
        })
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

async function deleteUserById(req, res) {
    try {
        const userId = req.params.id;
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
            data: user
        })
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

async function updateUserById(req, res) {
    try {
        const userId = req.params.id;
        const updateData = req.body;
        const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: user
        })
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

async function userBlockUnblock(req, res) {
    try {
        const userId = req.params.id;
        const { isBlocked } = req.body;
        const user = await User.findByIdAndUpdate(userId, { isBlocked }, { new: true });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: isBlocked ? "User blocked successfully" : "User unblocked successfully",
            data: user
        })
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

// craneMan related controller

async function assignCraneMan(req, res) {
    try {
        const { carId } = req.params;
        const { craneManId, inseptionDate } = req.body;
        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({
                success: false,
                message: "Car not found"
            });
        }
        car.craneMan = craneManId;
        car.inseptionDate = inseptionDate;
        await car.save();
        return res.status(200).json({
            success: true,
            message: "Crane man assigned successfully",
            data: car
        })
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

async function createCraneMan(req, res) {
    try {
        const { name, email, phone, address } = req.body;
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            const isSameRole = existingUser.role === "craneMan";
            return res.status(400).json({
                success: false,
                message: `${isSameRole ? "Crane man" : "User"} with phone number ${phone} already exists`,
            });
        }
        const craneMan = await User.create({ name, email, phone, address, role: "craneMan" });
        return res.status(200).json({
            success: true,
            message: "Crane man created successfully",
            data: craneMan
        })
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

async function getAllCraneUsers(req, res) {
    try {
        const {
            search    = "",
            isBlocked = "",
            page      = 1,
            limit     = 10,
        } = req.query;

        // ── Build filter ──────────────────────────────────────────
        const filter = { role: "craneMan" };

        // isBlocked
        if (isBlocked === "true")  filter.isBlocked = true;
        if (isBlocked === "false") filter.isBlocked = false;

        // search — name, email, phone, address
        if (search.trim()) {
            filter.$or = [
                { name:    { $regex: search.trim(), $options: "i" } },
                { email:   { $regex: search.trim(), $options: "i" } },
                { phone:   { $regex: search.trim(), $options: "i" } },
                { address: { $regex: search.trim(), $options: "i" } },
            ];
        }

        // ── Pagination ────────────────────────────────────────────
        const pageNum  = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip     = (pageNum - 1) * limitNum;

        // ── Query ─────────────────────────────────────────────────
        const [users, total] = await Promise.all([
            User.find(filter)
                .select("-otp -otpExpiry -__v")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            User.countDocuments(filter),
        ]);

        return res.status(200).json({
            success:    true,
            message:    "Crane men retrieved successfully",
            data:       users,
            total,
            page:       pageNum,
            limit:      limitNum,
            totalPages: Math.ceil(total / limitNum),
        });

    } catch (error) {
        console.log("Internal server error", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error:   error.message,
        });
    }
}

// dashboard data controller 

async function getDashboardData(req, res) {
    try {
        const allUsers = await User.find();
        const allCar = await Car.find();
        const totalUser = allUsers.filter(user => user.role === "user").length;
        const totalCraneman = allUsers.filter(user => user.role === "craneMan").length;
        const totalCars = allCar.length;
        const totalProcessingCars = allCar.filter(car => car.status === "processing").length;
        const totalCompletedCars = allCar.filter(car => car.status === "sold").length;
        const totalPendingCars = allCar.filter(car => car.status === "pending").length;
        const totalRevenue = allCar.reduce((acc, car) => acc + (car.price || 0), 0);

        return res.status(200).json({
            success: true,
            message: "Dashboard data fetched successfully",
            data: {
                totalUser,
                totalCraneman,
                totalCars,
                totalProcessingCars,
                totalCompletedCars,
                totalPendingCars,
                totalRevenue
            }
        })
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

// car related controller

async function getAllCars(req, res) {
    try {
        let {
            page = 1,
            limit = 10,
            status,
            seller,
            craneMan,
            minPrice,
            maxPrice,
            search,
            sortBy = "createdAt",
            order = "desc",
        } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);

        /* =========================
   FILTER BUILDING
========================= */
        const filter = {
            onlyForCheck: false, // 👈 always false data hi fetch hoga
        };

        if (status) {
            filter.status = status;
        }

        if (seller) {
            filter.seller = seller;
        }

        if (craneMan) {
            filter.craneMan = craneMan;
        }

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        // 🔍 Search (RC number / location)
        if (search) {
            filter.$or = [
                { rcNumber: { $regex: search, $options: "i" } },
                { pickupLocation: { $regex: search, $options: "i" } },
            ];
        }

        /* =========================
           SORT
        ========================= */
        const sortOrder = order === "asc" ? 1 : -1;

        /* =========================
           QUERY EXECUTION
        ========================= */
        const total = await Car.countDocuments(filter);

        const jobs = await Car.find(filter)
            .populate("seller", "name email phone")
            .populate("craneMan")
            .sort({ [sortBy]: sortOrder })
            .skip((page - 1) * limit)
            .limit(limit);

        /* =========================
           RESPONSE
        ========================= */
        return res.status(200).json({
            success: true,
            message: "Jobs retrieved successfully",
            data: jobs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });

    } catch (error) {
        console.log("Internal server error", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

async function getCarById(req, res) {
    try {
        const carId = req.params.id;
        const car = await Car.findById(carId).populate("seller").populate("craneMan");
        if (!car) {
            return res.status(404).json({
                success: false,
                message: "Car not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Car retrieved successfully",
            data: car
        })
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

async function deleteCarById(req, res) {
    try {
        const carId = req.params.id;
        const car = await Car.findByIdAndDelete(carId);
        if (!car) {
            return res.status(404).json({
                success: false,
                message: "Car not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Car deleted successfully",
            data: car
        })
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

async function changeStatusCarById(req, res) {
    try {
        const carId = req.params.id;
        const { status } = req.body;
        const car = await Car.findByIdAndUpdate(carId, { status }, { new: true }).populate("seller").populate("craneMan");
        if (!car) {
            return res.status(404).json({
                success: false,
                message: "Car not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Car status updated successfully",
            data: car
        })
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

// rc details related controller

async function getAllRcDetails(req, res) {
    try {
        const {
            page = 1,
            limit = 10,
            search = "",
            status,
            fuelType,
            vehicleClass,
            startDate,
            endDate,
        } = req.query;

        const skip = (page - 1) * limit;

        let filter = {};

        // 🔍 Search (nested fields)
        if (search) {
            filter.$or = [
                { "carDetail.rcNumber": { $regex: search, $options: "i" } },
                { "carDetail.ownerName": { $regex: search, $options: "i" } },
                { "carDetail.model": { $regex: search, $options: "i" } },
                { "carDetail.engineNumber": { $regex: search, $options: "i" } },
            ];
        }

        // 📌 Status filter
        if (status) {
            filter["carDetail.status"] = status;
        }

        // ⛽ Fuel type filter
        if (fuelType) {
            filter["carDetail.fuelType"] = fuelType;
        }

        // 🚗 Vehicle class filter
        if (vehicleClass) {
            filter["carDetail.vehicleClass"] = vehicleClass;
        }

        // 📅 Date filter (createdAt)
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        // 👉 Parallel query (fast)
        const [data, total] = await Promise.all([
            RCDetail.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),

            RCDetail.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            message: "RC details retrieved successfully",
            data,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit),
            },
        });

    } catch (error) {
        console.log("Internal server error", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

async function deleteRcDetailById(req, res) {
    try {
        const rcDetailId = req.params.id;
        const rcDetail = await RCDetail.findByIdAndDelete(rcDetailId);
        if (!rcDetail) {
            return res.status(404).json({
                success: false,
                message: "RC detail not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "RC detail deleted successfully",
            data: rcDetail
        })
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

async function getRcDetailById(req, res) {
    try {
        const rcDetailId = req.params.id;
        const rcDetail = await RCDetail.findById(rcDetailId);
        if (!rcDetail) {
            return res.status(404).json({
                success: false,
                message: "RC detail not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "RC detail retrieved successfully",
            data: rcDetail
        })
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

// contact related controller 

async function getAllContactMessages(req, res) {
    try {
        const messages = await Contact.find().sort({ createdAt: -1 });
        const filteredMessages = messages.filter(message => !message.isQuote);
        const messageCount = filteredMessages.length;
        if (filteredMessages.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No contact messages found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Contact messages retrieved successfully",
            data: filteredMessages,
            count: messageCount
        })
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

async function deleteContactMessageById(req, res) {
    try {
        const messageId = req.params.id;
        const message = await Contact.findByIdAndDelete(messageId);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Contact message not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Contact message deleted successfully",
            data: message
        })
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

async function getAllQuoteRequests(req, res) {
    try {
        const messages = await Contact.find().sort({ createdAt: -1 });
        const filteredMessages = messages.filter(message => message.isQuote);
        const quoteCount = filteredMessages.length;
        if (filteredMessages.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No quote requests found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Quote requests retrieved successfully",
            data: filteredMessages,
            count: quoteCount
        })
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

module.exports = {
    adminLogin,
    getAllUsers,
    getAllCraneUsers,
    getUserById,
    deleteUserById,
    updateUserById,
    userBlockUnblock,
    getDashboardData,
    getAllCars,
    getCarById,
    deleteCarById,
    changeStatusCarById,
    assignCraneMan,
    createCraneMan,
    getAllRcDetails,
    deleteRcDetailById,
    getRcDetailById,
    getAllContactMessages,
    deleteContactMessageById,
    getAllQuoteRequests
}