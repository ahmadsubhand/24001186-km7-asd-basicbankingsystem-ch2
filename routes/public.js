import { Router } from "express";
import path from "path";
const router = new Router();

router.get('/reset-password', (req, res) => {
  try {
    const filePath = path.join(__dirname, '../../../../../public/reset-password.html');
    console.log(filePath);
    res.sendFile(path.join(filePath));
  } catch (err) {
    res.status(500).json({
      message: 'Failed bang',
      error: err.message || err
    })
  }
})

router.get('/', (req, res) => {
  const filePath = path.join(__dirname, '../../../../../public/index.html');
  res.sendFile(path.join(filePath));
});

export default router;