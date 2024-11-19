import { Router } from "express";
import sendEmail from "../services/mailer.js";

const router = new Router();

// router.post('/upload', storage.image.single('image'), storageImage);
router.post('/send', sendEmail);

export default router;