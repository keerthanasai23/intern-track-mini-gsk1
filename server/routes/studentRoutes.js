const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const auth = require('../middleware/auth');

// @route GET /api/student/details
// @desc Get current student details
// @access Private
router.get('/details', auth, async (req, res) => {
    try {
      const student = await Student.findById(req.user._id); // now this works since auth sets req.user
  
      if (!student) return res.status(404).json({ error: 'Student not found' });
  
      res.json({
        name: student.name,
        email: student.email,
        registerNumber: student.registerNumber,
        batch: student.batch
      });
    } catch (err) {
      res.status(500).json({ error: 'Server error', message: err.message });
    }
  });
// @route PUT /api/student/details
// @desc Update student details
// @access Private
router.put('/details', auth, async (req, res) => {
  const { name, email, batch } = req.body;
  
  // Add validation
  if (!name || !email || !batch) {
    return res.status(400).json({ 
      error: 'Name, email and batch are required' 
    });
  }

  try {
    const student = await Student.findByIdAndUpdate(
      req.user._id,
      { name, email, batch },
      { new: true, runValidators: true } // Add runValidators
    );
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ 
      message: 'Details updated successfully',
      student: {
        name: student.name,
        email: student.email,
        registerNumber: student.registerNumber,
        batch: student.batch
      }
    });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ 
      error: 'Error updating details',
      message: err.message 
    });
  }
});
  

module.exports = router;
