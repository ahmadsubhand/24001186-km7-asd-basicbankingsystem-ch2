import multer from "multer";
import path from "path";

const filename = (req, file, callback) => {
  const fileName = Date.now() + path.extname(file.originalname);
  callback(null, fileName);
}

const generateStorage = (destination) => {
  return multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, destination);
    },
    filename
  })
} 

export default {
  image: multer({
    storage: generateStorage('./public/images'),
    fileFilter: (req, file, callback) => {
      const allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
      if (allowedMimeTypes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        const err = new Error(`Only ${allowedMimeTypes.join(', ')} allowed to upload!`);
        callback(err, false);
      }
    },
    onError: (err, next) => {
      next(err);    
    }
  })
};

