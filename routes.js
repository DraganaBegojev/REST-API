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
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = await User.create({
        firstName,
        lastName,
        emailAddress,
        password: hashedPassword,
    });
    res.status(201).location('/').end();
}));

module.exports = router;

// Get /api/courses - Returns a list of courses including the User that owns each course
router.get('/courses', asyncHandler(async (req, res) => {
    const courses = await Course.findAll({
        include: [{
            model: User
        }]
    });
    res.status(200).json(courses);
}));

// Get /api/courses/:id - Returns a specific course including the User that owns the course
router.get('/courses/:id', asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id, {
        include: [{
            model: User
        }]
    });
    if (course) {
        res.status(200).json(course);
    } else {
        res.status(404).json({ message: 'Course Not Found' });
    }
}));

