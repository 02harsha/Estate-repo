import express from "express";
import {addPointsOnDailyCheckIn,getCurrentPoints} from "../controllers/pointsController.js"

const router = express.Router();

router.get("/", (req, res) => { 
    res.send("Points Routes are working");
});

router.post("/addPointsOnDailyCheckIn",addPointsOnDailyCheckIn)
router.post("/getCurrentPoints",getCurrentPoints)


export default router;