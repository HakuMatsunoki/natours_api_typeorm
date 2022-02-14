import express from "express";

import * as reviewController from "../controllers/reviewController";

const router = express.Router();

router.post("/", reviewController.createTour);
router.get("/", reviewController.getAllTours);
router.get("/:id", reviewController.getTour);
router.patch("/:id", reviewController.updateTour);
router.delete("/:id", reviewController.deleteTour);

export { router as reviewRouter };
