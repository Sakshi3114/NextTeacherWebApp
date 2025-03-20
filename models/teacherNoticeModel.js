import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const noticeSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now , expires: '30d'},
});

const teacherNoticeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  notices: [noticeSchema],
});

// Hash password before saving
teacherNoticeSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
teacherNoticeSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const TeacherNotice = mongoose.models.TeacherNotice || mongoose.model('TeacherNotice', teacherNoticeSchema);

export default TeacherNotice;