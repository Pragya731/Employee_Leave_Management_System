import mongoose, { Document } from 'mongoose';

export interface ILeaveType extends Document {
  name: string;
  description?: string;
  allowedDays: number;
  requiresApproval: boolean;
}

const leaveTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  allowedDays: { type: Number, required: true },
  requiresApproval: { type: Boolean, default: true },
}, { timestamps: true });

const LeaveType = mongoose.model<ILeaveType>('LeaveType', leaveTypeSchema);

export default LeaveType;