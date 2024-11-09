import { Router } from "express";
// import { imagekitUpload, storageImage } from '../controllers/media.js'
import { imagekitUpload } from "../controllers/media";
// import storage from '../libs/multer.js'
import Multer from "multer";

const router = new Router();
const multer = new Multer();

// router.post('/upload', storage.image.single('image'), storageImage);
router.post('/imagekit', multer.single('image'), imagekitUpload);

export default router;