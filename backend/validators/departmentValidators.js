const Joi = require('joi');

const departmentSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().allow('', null),
  manager: Joi.string().allow('', null)
});

module.exports = { departmentSchema };
