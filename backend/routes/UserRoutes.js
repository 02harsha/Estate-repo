import express from "express";
import { userLogin, userRegistration } from "../controllers/userController.js";

const router = express.Router();

router.get("/", (req, res) => { 
    res.send("User Routes are working");
});

router.post("/register", userRegistration);
router.post("/login", userLogin);

export default router;