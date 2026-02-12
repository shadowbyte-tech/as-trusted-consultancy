import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Global mongoose connection
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Plot Schema
const PlotSchema = new mongoose.Schema({
  plotNumber: { type: String, required: true },
  villageName: { type: String, required: true },
  areaName: { type: String, required: true },
  plotSize: { type: String, required: true },
  plotFacing: { 
    type: String, 
    enum: ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'],
    required: true 
  },
  imageUrl: { type: String, required: true },
  imageHint: { type: String, default: 'custom upload' },
  description: { type: String },
  price: { type: Number },
  pricePerSqft: { type: Number },
  priceNegotiable: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['Available', 'Reserved', 'Sold', 'Under Negotiation'],
    default: 'Available'
  },
  images: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['Owner', 'User'], required: true },
  createdAt: { type: Date, default: Date.now }
});

// Registration Schema
const RegistrationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  notes: { type: String },
  isNew: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Inquiry Schema
const InquirySchema = new mongoose.Schema({
  plotNumber: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  receivedAt: { type: Date, default: Date.now }
});

// Contact Schema
const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  type: { type: String, enum: ['Seller', 'Buyer'], required: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Password Schema (for storing hashed passwords)
const PasswordSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  hashedPassword: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});

// Export models
export const Plot = mongoose.models.Plot || mongoose.model('Plot', PlotSchema);
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Registration = mongoose.models.Registration || mongoose.model('Registration', RegistrationSchema);
export const Inquiry = mongoose.models.Inquiry || mongoose.model('Inquiry', InquirySchema);
export const Contact = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);
export const Password = mongoose.models.Password || mongoose.model('Password', PasswordSchema);

// Add to global type
declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}
