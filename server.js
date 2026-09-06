const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const JSON_FILE_PATH = path.join(__dirname, 'src', 'data', 'weapons.json');

// جلب البيانات من الملف
app.get('/api/weapons', (req, res) => {
  fs.readFile(JSON_FILE_PATH, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'فشل في قراءة الملف' });
    }
    res.json(JSON.parse(data));
  });
});

// حفظ البيانات في الملف
app.post('/api/weapons', (req, res) => {
  const updatedWeapons = req.body;
  fs.writeFile(JSON_FILE_PATH, JSON.stringify(updatedWeapons, null, 2), 'utf8', (err) => {
    if (err) {
      return res.status(500).json({ error: 'فشل في الحفظ بالملف' });
    }
    res.json({ message: 'تم الحفظ بالملف بنجاح!' });
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`السيرفر يعمل الآن على المنفذ http://localhost:${PORT}`));