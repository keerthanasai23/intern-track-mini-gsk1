const mongoose = require('mongoose');

const InternshipSchema = new mongoose.Schema({
  batch: { 
    type: String, 
    required: [true, 'Batch is required'],
    trim: true,
    uppercase: true
  },
  registerNumber: { 
    type: String, 
    required: [true, 'Register number is required'], 
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[A-Z0-9]{5,20}$/.test(v);
      },
      message: 'Invalid register number format'
    }
  },
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'],
    lowercase: true
  },
  mobileNumber: { 
    type: String, 
    required: [true, 'Mobile number is required'],
    match: [/^[0-9]{10}$/, 'Invalid mobile number'] 
  },
  obtainedThroughCDC: { type: Boolean, default: false },
  internshipAbroad: { type: Boolean, default: false },
  duration: { 
    type: String, 
    required: [true, 'Duration is required'],
    match: [/^[0-9]+ weeks?$/, 'Duration should be in weeks'] 
  },
  companyName: { 
    type: String, 
    required: [true, 'Company name is required'],
    trim: true 
  },
  stipend: { 
    type: Number, 
    min: [0, 'Stipend cannot be negative'] 
  },
  documentPath: { 
    type: String,
    required: [true, 'Document is required']
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Add index for better performance
InternshipSchema.index({ registerNumber: 1 });
InternshipSchema.index({ batch: 1, registerNumber: 1 });

module.exports = mongoose.model('Internship', InternshipSchema);