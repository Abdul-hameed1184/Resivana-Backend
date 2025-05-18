import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  status: {
    type: String,
    enum: ["Available", "Pending", "Sold"],
    default: "Available",
  },
  images: [{ type: String }],
  type: {
    type: String,
    enum: ["House", "Apartment", "Commercial", "Car"],
    required: true,
  },
  tags: {
    type: [{ type: String }],
    default: [],
  },
  amenities: {
    type: [{type: String}],
    default: [],
  },
  bedrooms: { type: Number, required: false },
  bathrooms: { type: Number, required: false },
  featured : {
    type: Boolean,
    default: false,
    required: false
  }, 
  agent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to User model
  createdAt: { type: Date, default: Date.now },
});

  const Property = mongoose.model('Property', propertySchema);

    export default Property;