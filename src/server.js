const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import CORS middleware
const authRoutes = require('./routes/auth'); // Adjust the path as needed
const bugRoutes = require('./routes/bug'); // Adjust the path as needed
const dotenv = require('dotenv'); // Import dotenv for environment variables
const path = require('path'); // Import path for serving static files

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection string
const mongoURI = process.env.MONGODB_URI || "mongodb+srv://obafemitobi438:Pastortobi.438@bugtrackerdb.bdyml.mongodb.net/?retryWrites=true&w=majority&appName=BugTrackerDB"; // Replace with your actual MongoDB connection string

// Connect to MongoDB with options
mongoose.connect(mongoURI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1); // Exit process with failure
    });

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded images

// Simple route for testing
app.get('/', (req, res) => {
    res.send('Bug Tracker API is running!');
});

// Use the routes
app.use('/api/auth', authRoutes);
app.use('/api/bug', bugRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
