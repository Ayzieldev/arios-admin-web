const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const deliveryBoySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  avatar: {
    type: String,
    default: ''
  },
  vehicleNumber: {
    type: String,
    required: true
  },
  vehicleType: {
    type: String,
    enum: ['bike', 'car', 'scooter'],
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'busy', 'offline', 'suspended'],
    default: 'offline'
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalDeliveries: {
    type: Number,
    default: 0
  },
  completedDeliveries: {
    type: Number,
    default: 0
  },
  documents: {
    license: String,
    insurance: String,
    vehicleRegistration: String
  },
  earnings: {
    total: {
      type: Number,
      default: 0
    },
    thisMonth: {
      type: Number,
      default: 0
    },
    thisWeek: {
      type: Number,
      default: 0
    }
  },
  workingHours: {
    startTime: String,
    endTime: String,
    daysOff: [String]
  }
}, {
  timestamps: true
});

// Index for geospatial queries
deliveryBoySchema.index({ currentLocation: '2dsphere' });

// Hash password before saving
deliveryBoySchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
deliveryBoySchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON response
deliveryBoySchema.methods.toJSON = function() {
  const deliveryBoy = this.toObject();
  delete deliveryBoy.password;
  return deliveryBoy;
};

module.exports = mongoose.model('DeliveryBoy', deliveryBoySchema); 