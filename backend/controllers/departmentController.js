const Department = require('../models/Department');
const Employee = require('../models/Employee');

const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().populate('manager', 'firstName lastName');
    // attach employee count per department
    const counts = await Employee.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);
    const countMap = counts.reduce((acc, c) => {
      if (c._id) acc[c._id.toString()] = c.count;
      return acc;
    }, {});

    const result = departments.map((d) => ({
      ...d.toObject(),
      employeeCount: countMap[d._id.toString()] || 0
    }));

    res.json({ success: true, count: result.length, departments: result });
  } catch (error) {
    next(error);
  }
};

const getDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id).populate('manager', 'firstName lastName');
    if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, department });
  } catch (error) {
    next(error);
  }
};

const createDepartment = async (req, res, next) => {
  try {
    const existing = await Department.findOne({ name: req.body.name });
    if (existing) return res.status(400).json({ success: false, message: 'Department already exists' });

    const department = await Department.create(req.body);
    res.status(201).json({ success: true, department });
  } catch (error) {
    next(error);
  }
};

const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, department });
  } catch (error) {
    next(error);
  }
};

const deleteDepartment = async (req, res, next) => {
  try {
    const inUse = await Employee.countDocuments({ department: req.params.id });
    if (inUse > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: ${inUse} employee(s) are assigned to this department`
      });
    }
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDepartments, getDepartment, createDepartment, updateDepartment, deleteDepartment };
