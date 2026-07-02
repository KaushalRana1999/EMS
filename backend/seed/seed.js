require('dotenv').config();
const connectDB = require('../config/db');
const logger = require('../utils/logger');

const User = require('../models/User');
const Employee = require('../models/Employee');
const Department = require('../models/Department');

const seed = async () => {
  try {
    await connectDB();

    // --- Admin Account ---
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@ems.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      logger.info(`Admin account already exists (${adminEmail}). Skipping admin creation.`);
    } else {
      // Pass the PLAIN password — User model's pre('save') hook hashes it once.
      const adminUser = await User.create({
        name: process.env.SEED_ADMIN_NAME || 'System Admin',
        email: adminEmail,
        password: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345',
        role: 'admin'
      });

      const adminEmployee = await Employee.create({
        user: adminUser._id,
        employeeId: 'EMP0001',
        firstName: 'System',
        lastName: 'Admin',
        designation: 'Administrator',
        employmentType: 'full-time',
        status: 'active'
      });

      adminUser.employee = adminEmployee._id;
      await adminUser.save();

      logger.info(`Admin account created: ${adminEmail} / ${process.env.SEED_ADMIN_PASSWORD || 'Admin@12345'}`);
    }

    // --- Default Departments ---
    const deptCount = await Department.countDocuments();
    if (deptCount === 0) {
      await Department.insertMany([
        { name: 'Human Resources', description: 'Handles recruitment, onboarding, and employee relations' },
        { name: 'Engineering', description: 'Product development and technical operations' },
        { name: 'Sales', description: 'Business development and client relations' },
        { name: 'Finance', description: 'Accounting, payroll, and financial planning' }
      ]);
      logger.info('Default departments created: HR, Engineering, Sales, Finance');
    } else {
      logger.info('Departments already exist. Skipping department seeding.');
    }

    // --- Sample Employees ---
    const sampleUsers = [
      {
        name: 'HR Manager',
        email: 'hr@ems.com',
        password: 'Hr@12345',
        role: 'hr',
        employeeId: 'EMP0002',
        firstName: 'HR',
        lastName: 'Manager',
        designation: 'HR Manager',
        employmentType: 'full-time',
        status: 'active'
      },
      {
        name: 'Engineer User',
        email: 'engineer@ems.com',
        password: 'Eng@12345',
        role: 'employee',
        employeeId: 'EMP0003',
        firstName: 'Engineer',
        lastName: 'User',
        designation: 'Software Engineer',
        employmentType: 'full-time',
        status: 'active'
      }
    ];

    for (const u of sampleUsers) {
      const exists = await User.findOne({ email: u.email });
      if (exists) {
        logger.info(`Sample account already exists (${u.email}). Skipping.`);
        continue;
      }

      // Pass the PLAIN password here too — do NOT pre-hash it, the model does that.
      const user = await User.create({
        name: u.name,
        email: u.email,
        password: u.password,
        role: u.role
      });

      const employee = await Employee.create({
        user: user._id,
        employeeId: u.employeeId,
        firstName: u.firstName,
        lastName: u.lastName,
        designation: u.designation,
        employmentType: u.employmentType,
        status: u.status
      });

      user.employee = employee._id;
      await user.save();

      logger.info(`Sample account created: ${u.email} / ${u.password}`);
    }

    logger.info('Seeding complete.');
    process.exit(0);
  } catch (error) {
    logger.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seed();