const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const Internship = require('./models/Internship');
const Student = require('./models/Student');
const Coordinator = require('./models/Coordinator');

const app = express();
app.use(express.json());
// 🔥 Add CORS middleware here
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']

}));
//edit 
const studentRoutes = require('./routes/studentRoutes');
app.use('/api/student', studentRoutes);

dotenv.config();
// Middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Configuration
const JWT_SECRET = 'your_jwt_secret_key'; // Store in environment variables in production
const PORT = 5000;
const documentsRoot = path.join(__dirname, 'documents');

// Database Connection
mongoose.connect('mongodb://127.0.0.1:27017/internTrackDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// File Upload Setup
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const { batch, registerNumber } = req.body;
      
      if (!batch || !registerNumber) {
        throw new Error('Batch and Register Number are required for folder creation');
      }

      const sanitizedBatch = batch.replace(/[^a-zA-Z0-9-_]/g, '');
      const sanitizedRegNo = registerNumber.replace(/[^a-zA-Z0-9-_]/g, '');
      const dir = path.join(documentsRoot, sanitizedBatch, sanitizedRegNo);
      
      await fs.ensureDir(dir);
      console.log(`Directory created at: ${dir}`);

      const exists = await fs.pathExists(dir);
      if (!exists) throw new Error('Failed to verify directory creation');

      cb(null, dir);
    } catch (err) {
      console.error('Directory creation error:', err);
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    try {
      const { registerNumber } = req.body;
      const ext = path.extname(file.originalname);
      const docType = file.fieldname === 'document' ? 'Document' : 'Other';
      const sanitizedRegNo = registerNumber.replace(/[^a-zA-Z0-9-_]/g, '');
      cb(null, `${sanitizedRegNo}-${docType}${ext}`);
    } catch (err) {
      console.error('Filename generation error:', err);
      cb(err);
    }
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed'));
    }
  }
});

// Auth Middleware
const authMiddleware = (role) => async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error('Authentication required');

    const decoded = jwt.verify(token, JWT_SECRET);
    let user;

    if (role === 'student') {
      user = await Student.findById(decoded._id);
    } else if (role === 'coordinator') {
      user = await Coordinator.findById(decoded._id);
    }

    if (!user) throw new Error('User not found');

    req.token = token;
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

// Initialize Documents Directory
fs.ensureDir(documentsRoot)
  .then(() => console.log('Documents root directory verified'))
  .catch(err => console.error('Failed to setup documents root:', err));

// Serve static files
app.use('/documents', express.static(documentsRoot));

// Debug endpoint
app.get('/api/debug/folders', async (req, res) => {
  try {
    const folders = await fs.readdir(documentsRoot);
    res.json({
      documentsRoot,
      exists: await fs.pathExists(documentsRoot),
      folders,
      absolutePath: path.resolve(documentsRoot)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  console.log('User ID:', req.user?._id);
});

// Auth Routes
app.post('/api/register/student', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    const token = jwt.sign({ _id: student._id, role: 'student' }, JWT_SECRET);
    res.status(201).json({ student, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/register/coordinator', async (req, res) => {
  try {
    const coordinator = new Coordinator(req.body);
    await coordinator.save();
    const token = jwt.sign({ _id: coordinator._id, role: 'coordinator' }, JWT_SECRET);
    res.status(201).json({ coordinator, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/login/student', async (req, res) => {
  try {
    const student = await Student.findOne({ registerNumber: req.body.registerNumber });
    if (!student || !(await student.comparePassword(req.body.password))) {
      throw new Error('Invalid credentials');
    }
    const token = jwt.sign({ _id: student._id, role: 'student' }, JWT_SECRET);
    res.json({ student, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/login/coordinator', async (req, res) => {
  try {
    const coordinator = await Coordinator.findOne({ email: req.body.email });
    if (!coordinator || !(await coordinator.comparePassword(req.body.password))) {
      throw new Error('Invalid credentials');
    }
    const token = jwt.sign({ _id: coordinator._id, role: 'coordinator' }, JWT_SECRET);
    res.json({ coordinator, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Protected Internship Routes
app.post('/api/internships', authMiddleware('student'), upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Document is required' });
    }

    const relativePath = path.relative(documentsRoot, req.file.path).replace(/\\/g, '/');
    const internship = new Internship({
      ...req.body,
      studentId: req.user._id,
      documentPath: relativePath
    });

    await internship.save();
    res.status(201).json({
      message: 'Internship added successfully',
      data: internship,
      documentPath: relativePath
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Register number already exists' });
    }
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/internships', authMiddleware('student'), async (req, res) => {
  try {
    const internships = await Internship.find({ studentId: req.user._id }).sort({ createdAt: -1 });
    res.json(internships);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Coordinator-only route example
app.get('/api/all-internships', authMiddleware('coordinator'), async (req, res) => {
  try {
    const internships = await Internship.find().sort({ createdAt: -1 });
    res.json(internships);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));