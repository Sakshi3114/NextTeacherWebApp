import dbConnect from "@/lib/dbConnect";
import TeacherNotice from '@/models/teacherNoticeModel';
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await dbConnect();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const existingTeacher = await TeacherNotice.findOne({ email });
    if (existingTeacher) {
      return NextResponse.json({ error: 'Teacher already registered with this email' }, { status: 400 });
    }

    const newTeacher = new TeacherNotice({ name, email, password });
    await newTeacher.save();

    return NextResponse.json({ message: 'Teacher registered successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
