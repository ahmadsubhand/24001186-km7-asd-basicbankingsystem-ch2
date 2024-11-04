import imagekit from "../libs/imagekit.js";

const storageImage = (req, res) => {
  const imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
  return res.status(200).json({
    status: true,
    message: 'success',
    data: {
      image_url: imageUrl
    }
  })
}

const iamgeKitUpload = async(req, res) => {
  try {
    const stringFile = req.file.buffer.toString('base64');
    const uploadFile = await imagekit.upload({
      fileName: req.file.originalname,
      file: stringFile
    })
    return res.json({
      status: true,
      message: 'success',
      data: {
        name: uploadFile.name,
        url: uploadFile.url,
        type: uploadFile.fileType
      }
    })
  } catch(err) {
    console.log(err);
    res.status(500).json({
      message: 'Failed to upload image',
      error: err
    })
  }
}

export { storageImage, iamgeKitUpload }