const User = require('../models/User');
const Employee = require('../models/Employee');

// @desc Get all employees (with search/filter/pagination)
// @route GET /api/employees
const getEmployees = async (req, res, next) => {
  try {
    const { search, department, status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (department) query.department = department;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [employees, total] = await Promise.all([
      Employee.find(query)
        .populate('department', 'name')
        .populate('user', 'name email role isActive')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Employee.countDocuments(query)
    ]);

    res.json({
      success: true,
      count: employees.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      employees
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single employee
// @route GET /api/employees/:id
const getEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department', 'name')
      .populate('user', 'name email role isActive');
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    // Employees may only view their own profile; admin/hr can view all
    if (req.user.role === 'employee' && String(employee.user._id) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this profile' });
    }

    res.json({ success: true, employee });
  } catch (error) {
    next(error);
  }
};

// @desc Create employee (admin/hr) - creates User + Employee together
// @route POST /api/employees
const createEmployee = async (req, res, next) => {
  try {
    const { name, email, password, role, ...employeeData } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already in use' });

    const user = await User.create({ name, email, password, role: role || 'employee' });

    const empCount = await Employee.countDocuments();
    const employee = await Employee.create({
      ...employeeData,
      user: user._id,
      employeeId: `EMP${String(empCount + 1).padStart(4, '0')}`
    });

    user.employee = employee._id;
    await user.save();

    const populated = await employee.populate([
      { path: 'department', select: 'name' },
      { path: 'user', select: 'name email role isActive' }
    ]);

    res.status(201).json({ success: true, employee: populated });
  } catch (error) {
    next(error);
  }
};

// @desc Update employee profile / job / bank details
// @route PUT /api/employees/:id
const updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    if (req.user.role === 'employee' && String(employee.user) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
    }

    // Employees cannot change sensitive job/salary fields themselves
    if (req.user.role === 'employee') {
      delete req.body.salary;
      delete req.body.department;
      delete req.body.designation;
      delete req.body.status;
      delete req.body.employmentType;
    }

    Object.assign(employee, req.body);
    await employee.save();

    const populated = await employee.populate([
      { path: 'department', select: 'name' },
      { path: 'user', select: 'name email role isActive' }
    ]);

    res.json({ success: true, employee: populated });
  } catch (error) {
    next(error);
  }
};

// @desc Delete employee (admin only)
// @route DELETE /api/employees/:id
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    await User.findByIdAndDelete(employee.user);
    await employee.deleteOne();

    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee };
