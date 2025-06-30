import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    position: { type: String, required: true },

    // Optional: Keep redundant info for easy access (not mandatory)
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    department: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);
