const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Validator = require('validator');

// Load model
const User = require('../models/User');

// Middleware to validate data before registering admin
exports.validateRegister = (req, res, next) => {
  const errors = {};

  const { email, username, password } = req.body;

  if (!Validator.isEmail(email)) {
    errors.email = 'Email is invalid';
  }

  if (Validator.isEmpty(email)) {
    errors.email = 'Email is required';
  }

  if (Validator.isEmpty(username)) {
    errors.username = 'Username is required';
  }

  if (Validator.isEmpty(password)) {
    errors.password = 'Password is required';
  }

  if (
    !Validator.isLength(password, {
      min: 10,
      max: undefined
    })
  ) {
    errors.password = 'Password must be at least 10 characters';
  }

  // Check for any errors
  if (Object.keys(errors).length !== 0) {
    return res.status(400).json(errors);
  }
  next(); // No errors move to registering user.
};

// Middleware to validate data before login
exports.validateLogin = (req, res, next) => {
  const errors = {};

  const { username, password } = req.body;

  if (Validator.isEmpty(username)) {
    errors.username = 'Username is required';
  }

  if (Validator.isEmpty(password)) {
    errors.password = 'Password is required';
  }

  // Check for any errors
  if (Object.keys(errors).length !== 0) {
    return res.status(400).json(errors);
  }

  // No errors move to login user.
  next();
};

// @route POST /register
// @desc register the website admin
// @access Public
exports.register = (req, res) => {
  // Query db and look for a user with the admin role
  User.findOne({ role: req.body.role }).then(isAdmin => {
    // Check if admin exist
    if (isAdmin) {
      return res.status(400).json({ error: 'No more users are allowed at this time.' });
    }
    // Create admin
    const newAdmin = new User({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      role: req.body.role
    });

    // Encrypt password
    bcrypt.genSalt(10, (genErr, salt) => {
      bcrypt.hash(newAdmin.password, salt, (hashErr, hash) => {
        if (genErr) throw genErr;
        if (hashErr) throw hashErr;
        // Replace password with hash
        newAdmin.password = hash;
        // Save to db
        newAdmin
          .save()
          .then(() => res.json({ message: 'New admin was added successfully' }))
          .catch(err => res.status(400).json({ registrationError: err }));
      });
    });
  });
};

// @route POST /login
// @desc login user to make changes
// @access Public
exports.login = (req, res) => {
  const { username, password } = req.body;

  // Query db and check to see if an admin has registered
  User.findOne({ username }).then(user => {
    // Check for a user
    if (!user) {
      return res.status(400).json({ loginError: 'User does not exist' });
    }

    // Check if the user is the admin
    if (user.role === 'admin') {
      // Check password
      bcrypt.compare(password, user.password).then(isPassword => {
        if (isPassword) {
          // Create payload
          const payload = {
            id: user.id
            // username: user.username,
            // role: user.role
          };

          // Sign token
          jwt.sign(payload, process.env.SECRETORKEY, { expiresIn: 3600 }, (err, token) => {
            res.json({
              success: true,
              token: `Bearer ${token}`
            });
          });
        } else {
          return res.status(400).json({ loginError: 'Password is incorrect' });
        }
      });
    } else {
      return res.status(401).json({ loginError: 'Access denied' });
    }
  });
};
