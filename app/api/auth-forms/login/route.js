import dbConnect from "@/lib/dbConnect";
import TeacherNotice from '@/models/teacherNoticeModel';
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password) {
      return  NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const teacher = await TeacherNotice.findOne({ email });
    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    const isPasswordValid = await teacher.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    return NextResponse.json({ 
    message: 'Login successful', 
    teacherId: teacher._id,
    teacherName: teacher.name 
   },{ status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
