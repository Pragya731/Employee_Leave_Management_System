import mongoose from 'mongoose';

const LeavePolicySchema = new mongoose.Schema({
  casual: Number,
  sick: Number,
  earned: Number,
  // Optional: employerId if multi-tenant
});

export default mongoose.models.LeavePolicy || mongoose.model('LeavePolicy', LeavePolicySchema);
