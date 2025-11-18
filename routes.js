'use strict';

const express = require('express');
const router = express.Router();
const { authenticateUser } = require('./middleware/auth-user');
const { User } = require('./models');
const bcrypt = require('bcryptjs');

