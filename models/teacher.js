import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true,  },
    number: { type: String, required: true },
    email: { type: String, required: true },
    department: {type: String, required:true},
    lecture1: { type: String, default: "" },
    lecture2: { type: String, default: "" },
    lecture3: { type: String, default: "" },
    lecture4: { type: String, default: "" },
    lecture5: { type: String, default: "" },
    lecture6: { type: String, default: "" },
    lecture7: { type: String, default: "" },
    lecture8: { type: String, default: "" },
}, { timestamps: true });

const Teacher = mongoose.models.Teacher || mongoose.model("Teacher", teacherSchema);
export default Teacher;
