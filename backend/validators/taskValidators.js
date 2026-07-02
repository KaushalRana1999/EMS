const Joi = require('joi');

const taskSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().allow('', null),
  assignedTo: Joi.string().required(),
  dueDate: Joi.date().allow(null),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
  status: Joi.string().valid('pending', 'in-progress', 'completed', 'cancelled').optional()
});

const updateTaskSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string().allow('', null),
  dueDate: Joi.date().allow(null),
  priority: Joi.string().valid('low', 'medium', 'high'),
  status: Joi.string().valid('pending', 'in-progress', 'completed', 'cancelled')
}).min(1);

module.exports = { taskSchema, updateTaskSchema };
