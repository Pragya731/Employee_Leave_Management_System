import { Request, Response } from 'express';
import User from "../models/User";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


export const loginUser = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  try {
    const user = await User.findOne({ email, role });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'yoursecretkey',
      { expiresIn: '1d' }
    );

    // Send both token and userId in response
    res.status(200).json({ 
      message:'login successful',
      token, 
      userId: user._id 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createManager = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingManager = await User.findOne({ email });
    if (existingManager) {
      return res.status(400).json({ message: 'Manager already exists' });
    }

    const [firstName, ...rest] = name.trim().split(' ');
    const lastName = rest.join(' ') || 'Manager';

    const username = email.split('@')[0]; // simple username generation
    const dateOfJoining = new Date();     // or accept from frontend if needed

    const hashedPassword = await bcrypt.hash(password, 10);

    const newManager = new User({
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword,
      role: 'manager',
      dateOfJoining
    });

    await newManager.save();
    res.status(201).json(newManager);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating manager' });
  }
};

export const getManagers = async (req: Request, res: Response) => {
  try {
    const managers = await User.find({ role: 'manager' }).select('firstName lastName email');
    res.status(200).json(managers);
  } catch (error) {
    console.error('Error fetching managers:', error);
    res.status(500).json({ message: 'Failed to fetch managers' });
  }
};