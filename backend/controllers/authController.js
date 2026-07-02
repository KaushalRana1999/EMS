const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

// @desc Register a new user (defaults to employee role unless specified by an admin elsewhere)
// @route POST /api/auth/signup
const signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Public signup is always 'employee' — role escalation must go through admin endpoints
    const user = await User.create({ name, email, password, role: 'employee' });

    // auto-create a bare employee profile
    const empCount = await Employee.countDocuments();
    const employee = await Employee.create({
      user: user._id,
      employeeId: `EMP${String(empCount + 1).padStart(4, '0')}`,
      firstName: name.split(' ')[0] || name,
      lastName: name.split(' ').slice(1).join(' ') || '-'
    });
    user.employee = employee._id;
    await user.save();

    const token = signToken(user);
    res.status(201).json({ success: true, token, user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// @desc Login
// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const token = signToken(user);
    res.json({ success: true, token, user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// @desc Get current logged-in user
// @route GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'employee',
      populate: { path: 'department', select: 'name' }
    });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login, getMe };
