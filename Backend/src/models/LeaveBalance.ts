import mongoose, { Document, Schema } from 'mongoose';

export interface ILeaveBalance extends Document {
  userId: mongoose.Types.ObjectId;
  leaveTypeId: mongoose.Types.ObjectId;
  balance: number;
  year: number;
}

const leaveBalanceSchema = new Schema<ILeaveBalance>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    leaveTypeId: { type: Schema.Types.ObjectId, ref: 'LeaveType', required: true },
    balance: { type: Number, required: true },
    year: { type: Number, required: true },
  },
  { timestamps: true }
);

const LeaveBalance = mongoose.models.LeaveBalance || mongoose.model<ILeaveBalance>('LeaveBalance', leaveBalanceSchema);

export default LeaveBalance;
