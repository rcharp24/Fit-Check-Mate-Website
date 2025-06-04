const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const app = express();

app.post('/upload', upload.fields([
  { name: 'topImage', maxCount: 1 },
  { name: 'bottomImage', maxCount: 1 },
  { name: 'shoeImage', maxCount: 1 }
]), (req, res) => {
  console.log('Files:', req.files);
  res.json({ message: 'Files received' });
});

app.listen(3000, () => console.log('Listening on port 3000'));
