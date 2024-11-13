const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const Bug = require('../models/Bug');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory for uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
    },
});

const upload = multer({ storage });

// Search bugs by status and priority (GET /api/bug/search)
router.get('/search', authMiddleware, async (req, res) => {
    try {
        const { status, priority } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (priority) filter.priority = priority;

        const bugs = await Bug.find(filter);
        res.status(200).json(bugs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new bug (POST /api/bug)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { title, description, priority, status } = req.body;
        const imagePath = req.file ? req.file.path : null; // Store the image path

        const newBug = new Bug({ title, description, priority, status, image: imagePath });
        const savedBug = await newBug.save();

        res.status(201).json(savedBug);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all bugs (GET /api/bug)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const bugs = await Bug.find();
        res.status(200).json(bugs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific bug (GET /api/bug/:id)
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const bug = await Bug.findById(req.params.id);
        if (!bug) return res.status(404).json({ message: 'Bug not found' });

        res.status(200).json(bug);
    } catch (error) {
        res.status(400).json({ message: 'Invalid ID format' });
    }
});

// Update a bug and log status change history (PUT /api/bug/:id)
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { title, description, priority, status } = req.body;
        const imagePath = req.file ? req.file.path : null;

        const bug = await Bug.findById(req.params.id);
        if (!bug) return res.status(404).json({ message: 'Bug not found' });

        // Add status history if there's a status change
        if (status && bug.status !== status) {
            bug.statusHistory.push({
                oldStatus: bug.status,
                newStatus: status,
                changedAt: new Date(),
            });
        }

        // Update fields
        bug.title = title || bug.title;
        bug.description = description || bug.description;
        bug.priority = priority || bug.priority;
        bug.status = status || bug.status;
        if (imagePath) bug.image = imagePath;

        const updatedBug = await bug.save();
        res.status(200).json(updatedBug);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a bug (DELETE /api/bug/:id)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const deletedBug = await Bug.findByIdAndDelete(req.params.id);
        if (!deletedBug) return res.status(404).json({ message: 'Bug not found' });

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add a comment to a specific bug (POST /api/bug/:id/comments)
router.post('/:id/comments', authMiddleware, async (req, res) => {
    const { text, author } = req.body;
    try {
        const bug = await Bug.findById(req.params.id);
        if (!bug) return res.status(404).json({ message: 'Bug not found' });

        bug.comments.push({ text, author, createdAt: new Date() });
        await bug.save();

        res.status(201).json({ message: 'Comment added', comments: bug.comments });
    } catch (error) {
        res.status(500).json({ message: 'Error adding comment', error });
    }
});

// Example protected route (GET /api/bug/protected)
router.get('/protected', authMiddleware, (req, res) => {
    res.status(200).json({ message: `Hello, ${req.user.username}, you are authenticated!` });
});

module.exports = router;
