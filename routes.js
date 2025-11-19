'use strict';

const express = require('express');
const router = express.Router();
const { User, Course } = require('./models');
const bcrypt = require('bcryptjs');
const { authenticateUser } = require('./middleware/auth-user');
const { asyncHandler } = require('./middleware/async-handler');

// Get the currently authenticated user
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
    const user = req.currentUser;
    res.status(200).json({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress: user.emailAddress,
    });
}));

// Create a new user
router.post('/users', asyncHandler(async (req, res) => {
    const { firstName, lastName, emailAddress, password } = req.body;

    // Validate required fields
    const errors = [];
    if (!firstName) errors.push('First name is required');
    if (!lastName) errors.push('Last name is required');
    if (!emailAddress) errors.push('Email address is required');
    if (!password) errors.push('Password is required');

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    try {
        const newUser = await User.create({
            firstName,
            lastName,
            emailAddress,
            password: hashedPassword,
        });
        res.status(201).location('/').end();
    } catch (error) {
        // Handle unique constraint error
        if (error.name === 'SequelizeUniqueConstraintError') {
            const uniqueErrors = error.errors.map(err => err.message);
            return res.status(400).json({ errors: uniqueErrors });
        }
        // Forward other errors to global error handler
        throw error;
    }
}));
// Get /api/courses - Returns a list of courses including the User that owns each course
router.get('/courses', asyncHandler(async (req, res) => {
    const courses = await Course.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        include: [{
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'emailAddress']
        }]
    });
    res.status(200).json(courses);
}));

// Get /api/courses/:id - Returns a specific course including the User that owns the course
router.get('/courses/:id', asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id, {
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        include: [{
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'emailAddress']
        }]
    });
    if (course) {
        res.status(200).json(course);
    } else {
        res.status(404).json({ message: 'Course Not Found' });
    }
}));

// Create a new course
router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
    const user = req.currentUser;
    const course = await Course.create({
        title: req.body.title,
        description: req.body.description,
        estimatedTime: req.body.estimatedTime,
        materialsNeeded: req.body.materialsNeeded,
        userId: user.id
    });
    res.status(201).location(`/api/courses/${course.id}`).end();
}));

// Update an existing course
router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id);
    if (course) {
        if (course.userId !== req.currentUser.id) {
            return res.status(403).json({ message: 'You do not have permission to update this course' });
        }
        await course.update(req.body);
        res.status(204).end();
    } else {
        res.status(404).json({ message: 'Course Not Found' });
    }
}));

// Delete a course
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id);
    if (course) {
        if (course.userId !== req.currentUser.id) {
            return res.status(403).json({ message: 'You do not have permission to delete this course' });
        }
        await course.destroy();
        res.status(204).end();
    } else {
        res.status(404).json({ message: 'Course Not Found' });
    }
}));


module.exports = router;
