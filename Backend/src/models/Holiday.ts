import mongoose from 'mongoose';

const HolidaySchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true, unique: true },
});

export default mongoose.model('Holiday', HolidaySchema);
