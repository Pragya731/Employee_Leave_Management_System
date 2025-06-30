import { Request, Response } from 'express';
import LeaveRequest from '../models/LeaveRequest';
import LeaveBalance from '../models/LeaveBalance';
import LeaveType from '../models/LeaveType';
import Employee from '../models/Employee';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Holiday from '../models/Holiday';

// 1. Create new employee with default leave balances from LeaveType
export const createEmployee = async (req: Request, res: Response) => {
  try {
    const { name, email, department, position } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const [firstName, ...rest] = name.trim().split(' ');
    const lastName = rest.join(' ') || '-';

    const hashedPassword = await bcrypt.hash('defaultPassword123', 10);

    const newUser = new User({
      username: email,
      email,
      password: hashedPassword,
      role: 'employee',
      firstName,
      lastName,
      dateOfJoining: new Date(),
    });

    const savedUser = await newUser.save();

    const newEmployee = new Employee({
      userId: savedUser._id,
      name,
      email,
      department,
      position,
    });

    const savedEmployee = await newEmployee.save();

    const leaveTypes = await LeaveType.find();
    const year = new Date().getFullYear();

    const leaveBalances = leaveTypes.map((type) => ({
      userId: savedUser._id,
      leaveTypeId: type._id,
      balance: type.allowedDays,
      year,
    }));

    await LeaveBalance.insertMany(leaveBalances);

    res.status(201).json({ employee: savedEmployee, leaveBalances });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 2. Get all employees
export const getEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await Employee.find();

    const enrichedEmployees = await Promise.all(
      employees.map(async (emp) => {
        const userId = emp.userId;
        const balances = await LeaveBalance.find({ userId });

        const totalBalance = balances.reduce((sum, lb) => sum + (lb.balance || 0), 0);

        return {
          ...emp.toObject(),
          leaveBalance: totalBalance,
        };
      })
    );

    res.status(200).json(enrichedEmployees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// 3. Get employee dashboard summary
export const getEmployeeSummary = async (req: Request, res: Response) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const totalLeaveRequests = await LeaveRequest.countDocuments();
    res.status(200).json({ totalEmployees, totalLeaveRequests });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch summary' });
  }
};

export const getLoggedInEmployee = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const employee = await Employee.findOne({ userId });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 4. Update employee basic info (name, email, etc.)
export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { name, email, department, position } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    if (email && employee.email !== email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && String(existingUser._id) !== String(employee.userId)) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
      await User.findByIdAndUpdate(employee.userId, { email });
    }

    if (name) {
      employee.name = name;
      const [firstName, ...rest] = name.trim().split(' ');
      const lastName = rest.join(' ') || '-';
      await User.findByIdAndUpdate(employee.userId, { firstName, lastName });
    }

    employee.email = email || employee.email;
    employee.department = department || employee.department;
    employee.position = position || employee.position;

    const updatedEmployee = await employee.save();
    res.status(200).json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 5. Submit a new leave request
export const submitLeaveRequest = async (req: Request, res: Response) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const userId = (req as any).user?.id;

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) return res.status(400).json({ message: 'Start date cannot be after end date' });

    const leaveTypeDoc = await LeaveType.findOne({ name: leaveType });
    if (!leaveTypeDoc) return res.status(400).json({ message: `Leave type '${leaveType}' not found` });

    const durationInDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
    if (durationInDays > leaveTypeDoc.allowedDays) {
      return res.status(400).json({ message: `You can only apply up to ${leaveTypeDoc.allowedDays} days of ${leaveType}` });
    }

    const overlapping = await LeaveRequest.findOne({
      userId,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
        { startDate: { $gte: start }, endDate: { $lte: end } },
      ],
    });
    if (overlapping) return res.status(400).json({ message: 'Overlapping leave request found' });

    const newLeaveRequest = new LeaveRequest({
      userId,
      leaveTypeId: leaveTypeDoc._id,
      startDate,
      endDate,
      durationInDays,
      reason,
      status: 'pending',
    });

    await newLeaveRequest.save();
    res.status(201).json({ success: true, leaveRequest: newLeaveRequest });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting leave request' });
  }
};

// 6. Get leave history for logged in user
export const getLeaveHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const leaveRequests = await LeaveRequest.find({ userId }).populate('leaveTypeId', 'name');

    const formatted = leaveRequests.map((req) => ({
      id: req._id,
      type: (req.leaveTypeId as any).name,
      startDate: req.startDate,
      endDate: req.endDate,
      status: req.status.charAt(0).toUpperCase() + req.status.slice(1),
      reason: req.reason,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 7. Get full leave balances by leave type
export const getLeaveBalance = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const leaveBalances = await LeaveBalance.find({ userId }).populate('leaveTypeId', 'name');

    const formatted = leaveBalances.map((balance) => ({
      leaveType: (balance.leaveTypeId as { name: string }).name,
      balance: balance.balance,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 8. Get total pending leave days
export const getTotalPendingLeaveDays = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const pendingLeaves = await LeaveRequest.find({ userId, status: 'pending' });

    let totalDays = 0;
    pendingLeaves.forEach((leave) => {
      const diff = Math.ceil((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      totalDays += diff;
    });

    res.status(200).json({ totalPendingLeaveDays: totalDays });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


export const getUpcomingHolidays = async (req: Request, res: Response) => {
  const today = new Date()
  const holidays = await Holiday.find({ date: { $gte: today } }).sort({ date: 1 }).limit(5)
  res.json(holidays)
}

export const getEmployeeScore = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const debug = req.query.debug === 'true';

    // Fetch user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Fetch leave requests and balances
    const leaveRequests = await LeaveRequest.find({ userId }).sort({ startDate: 1 });
    const leaveBalances = await LeaveBalance.find({ userId });

    const totalLeaves = leaveRequests.length;
    const approvedLeaves = leaveRequests.filter(l => l.status === 'approved');
    const rejectedLeaves = leaveRequests.filter(l => l.status === 'rejected');
    const pendingLeaves = leaveRequests.filter(l => l.status === 'pending');

    // 1. Leave Discipline (30 pts)
    // Ratio of approved minus rejected leaves over total leaves (better discipline = higher score)
    const disciplineScore = totalLeaves > 0
      ? ((approvedLeaves.length - rejectedLeaves.length) / totalLeaves) * 30
      : 30;  // If no leaves, full score

    // 2. Attendance Encouragement (20 pts)
    // Encourage fewer leaves, higher score for low usedDays / allowedDays ratio
    const usedDays = approvedLeaves.reduce((sum, l) => sum + (l.durationInDays ?? 0), 0);
    const allowedDays = leaveBalances.reduce((sum, b) => sum + b.balance, 0);

    let usageScore = 0;
    let usedRatio = 0;
    if (allowedDays > 0) {
      usedRatio = usedDays / allowedDays;
      if (usedRatio <= 0.2) usageScore = 20;
      else if (usedRatio <= 0.4) usageScore = 15;
      else if (usedRatio <= 0.6) usageScore = 10;
      else if (usedRatio <= 0.8) usageScore = 5;
      else usageScore = 0;
    } else {
      usageScore = 10; // Neutral if no allowed days data
    }

    // 3. Timely Requests (15 pts)
    // Proportion of requests submitted at least 3 days before start date
    const timelyCount = leaveRequests.filter(l => {
      const created = new Date(l.createdAt).getTime();
      const start = new Date(l.startDate).getTime();
      const daysBefore = (start - created) / (1000 * 60 * 60 * 24);
      return daysBefore >= 3;
    }).length;
    const timelyRatio = totalLeaves > 0 ? timelyCount / totalLeaves : 1;
    const timelyScore = timelyRatio * 15;

    // 4. Pending Requests (10 pts)
    // Penalize for too many pending requests (max 10 pts)
    const pendingScore = Math.max(0, 10 - pendingLeaves.length * 2);

    // 5. Overlaps & Conflicts (10 pts)
    // Penalize overlapping leave requests (max 10 pts)
    let overlappingCount = 0;
    for (let i = 0; i < leaveRequests.length; i++) {
      for (let j = i + 1; j < leaveRequests.length; j++) {
        const a = leaveRequests[i];
        const b = leaveRequests[j];
        if (
          a.status !== 'rejected' &&
          b.status !== 'rejected' &&
          new Date(a.startDate) <= new Date(b.endDate) &&
          new Date(a.endDate) >= new Date(b.startDate)
        ) {
          overlappingCount++;
        }
      }
    }
    const overlapScore = Math.max(0, 10 - overlappingCount * 2);

    // 6. Tenure Bonus (15 pts)
    // Reward tenure up to 7.5 years (2 pts per year max 15 pts)
    const joinDate = new Date(user.dateOfJoining);
    const years = (Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    const tenureScore = Math.min(years * 2, 15);

    // Final Score (max 100 pts)
    const totalScore = disciplineScore + usageScore + timelyScore + pendingScore + overlapScore + tenureScore;

    // Format data for frontend
    const performance = {
      overallScore: Number(totalScore.toFixed(1)),           // out of 100
      attendanceDiscipline: Number(((disciplineScore / 30) * 100).toFixed(0)),   // %
      attendancePresence: Number(((usageScore / 20) * 100).toFixed(0)),          // %
      timelyRequests: Number(((timelyScore / 15) * 100).toFixed(0)),            // %
      pendingRequests: Number(((pendingScore / 10) * 100).toFixed(0)),          // %
      overlapHandling: Number(((overlapScore / 10) * 100).toFixed(0)),          // %
      tenureBonus: Number(((tenureScore / 15) * 100).toFixed(0))                // %
    };

    const result: any = {
      ...performance,
      breakdown: {
        disciplineScore: disciplineScore.toFixed(2),
        presenceScore: usageScore.toFixed(2),
        timelyScore: timelyScore.toFixed(2),
        pendingScore: pendingScore.toFixed(2),
        overlapScore: overlapScore.toFixed(2),
        tenureScore: tenureScore.toFixed(2),
      },
    };

    if (debug) {
      result.debug = {
        totalLeaves,
        approvedLeaves: approvedLeaves.length,
        rejectedLeaves: rejectedLeaves.length,
        pendingLeaves: pendingLeaves.length,
        usedDays,
        allowedDays,
        usedRatio: usedRatio.toFixed(2),
        timelyCount,
        timelyRatio: timelyRatio.toFixed(2),
        overlappingCount,
        yearsOfService: years.toFixed(2),
      };
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error calculating employee score:', error);
    res.status(500).json({ message: 'Failed to calculate performance score' });
  }
};