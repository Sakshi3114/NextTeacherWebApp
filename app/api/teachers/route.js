import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import TeacherNotice from '@/models/teacherNoticeModel';

export async function GET() {
  try {
    await dbConnect();
    const teachers = await TeacherNotice.find({}, 'name'); // Only fetch teacher names
    return NextResponse.json(teachers, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}