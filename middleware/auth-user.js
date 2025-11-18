'use strict';

const { User } = require('../models');
const auth = require('basic-auth');
const bcrypt = require('bcryptjs');

// Middleware to authenticate the user using Basic Auth
exports.authenticateUser = async (req, res, next) => {
  let message; // Store the message to display
  const credentials = auth(req);

  // If credentials are found in the request header
  if (credentials) {
    const user = await User.findOne({ where: { emailAddress: credentials.name } });
    if (user) {
      const authenticated = bcrypt.compareSync(credentials.pass, user.password);

      if (authenticated) { // If the passwords match
        console.log(`Authentication successful for username: ${user.emailAddress}`);
        req.currentUser = user; // Store the authenticated user on the request object
        return next();
      } else { // Passwords do not match
        message = `Authentication failure for username: ${user.emailAddress}`;
      }
    } else { // User not found
      message = `User not found for username: ${credentials.name}`;
    }
  } else { // No credentials found
    message = 'Auth header not found';
  }

  if (message) {
    console.warn(message);
    res.status(401).json({ message: 'Access Denied' });
  }
};

