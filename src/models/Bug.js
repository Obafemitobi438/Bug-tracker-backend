//Bug Schema Setup
// /models/Bug.js
// Defines the Bug model with fields like title,description, priority
// continued from above; status, image and Time
const mongoose = require('mongoose');

const bugSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
    status: { type: String, enum: ['Open', 'In Progress', 'Closed'], default: 'Open' },
    image: { type: String }, // Path to uploaded image
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

module.exports = mongoose.model('Bug', bugSchema);
