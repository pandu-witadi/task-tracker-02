const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utils/appError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, request) => {
  const token = signToken(user._id);
  
  // Remove password from output
  user.password = undefined;

  // Return both the token and cookie options
  return {
    token,
    data: {
      user,
    },
  };
};

const register = async (userData) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new AppError('Email already in use', 400);
  }

  // Create new user
  const newUser = await User.create({
    name: userData.name,
    email: userData.email,
    password: userData.password,
  });

  return newUser;
};

const login = async (email, password) => {
  // 1) Check if email and password exist
  if (!email || !password) {
    throw new AppError('Please provide email and password!', 400);
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password, user.password))) {
    throw new AppError('Incorrect email or password', 401);
  }

  // 3) If everything ok, send token to client
  return user;
};

const protect = async (request, reply) => {
  try {
    // 1) Getting token and check if it's there
    let token;
    if (
      request.headers.authorization &&
      request.headers.authorization.startsWith('Bearer')
    ) {
      token = request.headers.authorization.split(' ')[1];
    } else if (request.cookies.jwt) {
      token = request.cookies.jwt;
    }

    if (!token) {
      throw new AppError('You are not logged in! Please log in to get access.', 401);
    }

    // 2) Verification token
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return reject(new AppError('Invalid token. Please log in again!', 401));
        resolve(decoded);
      });
    });

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      throw new AppError('The user belonging to this token no longer exists.', 401);
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    request.user = currentUser;
    return currentUser;
  } catch (err) {
    throw new AppError('You are not authorized to access this route', 401);
  }
};

// Restrict to certain roles
const restrictTo = (...roles) => {
  return (request, reply, done) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(request.user.role)) {
      return done(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    done();
  };
};

module.exports = {
  register,
  login,
  protect,
  restrictTo,
  createSendToken,
};
