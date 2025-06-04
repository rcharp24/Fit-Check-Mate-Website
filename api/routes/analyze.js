const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/analyze', upload.fields([
  { name: 'topImage', maxCount: 1 },
  { name: 'bottomImage', maxCount: 1 },
  { name: 'shoeImage', maxCount: 1 }
]), (req, res) => {
  console.log('Received files:', req.files); // Should print files object
  res.json({ message: 'Images received', files: req.files });
});

module.exports = router;
