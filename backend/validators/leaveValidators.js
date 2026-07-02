const Joi = require('joi');

const leaveSchema = Joi.object({
  leaveType: Joi.string().valid('casual', 'sick', 'earned', 'unpaid', 'maternity', 'paternity').required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().min(Joi.ref('startDate')).required(),
  reason: Joi.string().min(3).required()
});

const reviewLeaveSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected').required(),
  reviewComment: Joi.string().allow('', null)
});

module.exports = { leaveSchema, reviewLeaveSchema };
