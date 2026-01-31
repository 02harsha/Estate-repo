import express from "express";
import {
    adminSignup,
    adminLogin,
    getDashboardStats,
    getUsers,
    exportUsers,
    sendOtp,
    verifyOtp,
    changePassword,
    changeEmail
} from "../controllers/AdminController.js";

const router = express.Router();

router.post("/signup", adminSignup);
router.post("/login", adminLogin);
router.get("/stats", getDashboardStats);
router.get("/users", getUsers);
router.get("/users/export", exportUsers);

// Security Routes
router.post("/security/send-otp", sendOtp);
router.post("/security/verify-otp", verifyOtp);
router.post("/security/change-password", changePassword);
router.post("/security/change-email", changeEmail);

export default router;
