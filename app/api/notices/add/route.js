import dbConnect from '@/lib/dbConnect';
import TeacherNotice from '@/models/teacherNoticeModel';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    await dbConnect();
    const { teacherId, noticeText } = await req.json();

    if (!teacherId || !noticeText) {
      return NextResponse.json({ error: 'Teacher ID and notice text are required' }, { status: 400 });
    }

    const teacher = await TeacherNotice.findById(teacherId);
    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Add the new notice to the teacher's notices array
    teacher.notices.push({ text: noticeText });
    await teacher.save();

    return NextResponse.json({ message: 'Notice added successfully', teacher });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
