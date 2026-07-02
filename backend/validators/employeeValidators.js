const Joi = require('joi');

const createEmployeeSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'hr', 'employee').optional(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  phone: Joi.string().allow('', null),
  dob: Joi.date().allow(null),
  gender: Joi.string().valid('male', 'female', 'other').allow('', null),
  address: Joi.string().allow('', null),
  department: Joi.string().allow('', null),
  designation: Joi.string().allow('', null),
  dateOfJoining: Joi.date().allow(null),
  employmentType: Joi.string().valid('full-time', 'part-time', 'contract', 'intern').optional(),
  salary: Joi.number().min(0).optional(),
  bankDetails: Joi.object({
    accountHolderName: Joi.string().allow('', null),
    accountNumber: Joi.string().allow('', null),
    bankName: Joi.string().allow('', null),
    ifscCode: Joi.string().allow('', null)
  }).optional()
});

const updateEmployeeSchema = Joi.object({
  firstName: Joi.string(),
  lastName: Joi.string(),
  phone: Joi.string().allow('', null),
  dob: Joi.date().allow(null),
  gender: Joi.string().valid('male', 'female', 'other').allow('', null),
  address: Joi.string().allow('', null),
  department: Joi.string().allow('', null),
  designation: Joi.string().allow('', null),
  employmentType: Joi.string().valid('full-time', 'part-time', 'contract', 'intern'),
  salary: Joi.number().min(0),
  status: Joi.string().valid('active', 'inactive', 'terminated'),
  photoUrl: Joi.string().allow('', null),
  bankDetails: Joi.object({
    accountHolderName: Joi.string().allow('', null),
    accountNumber: Joi.string().allow('', null),
    bankName: Joi.string().allow('', null),
    ifscCode: Joi.string().allow('', null)
  }).optional()
}).min(1);

module.exports = { createEmployeeSchema, updateEmployeeSchema };
