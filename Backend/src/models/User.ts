import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username:    { type: String, required: true, unique: true },
  email:       { type: String, required: true, unique: true },
  password:    { type: String, required: true },
  role:        { type: String, enum: ['employee', 'manager', 'hr', 'admin'], required: true },
  firstName:   { type: String, required: true },
  lastName:    { type: String, required: true },
  departmentId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  dateOfJoining: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
