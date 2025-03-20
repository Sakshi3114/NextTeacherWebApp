import dbConnect from "@/lib/dbConnect";
import TeacherNotice from "@/models/teacherNoticeModel";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  const { teacherId } = params;

  if (!mongoose.Types.ObjectId.isValid(teacherId)) {
    return NextResponse.json({ error: "Invalid teacherId" }, { status: 400 });
  }

  try {
    await dbConnect();
    const teacher = await TeacherNotice.findById(teacherId);

    if (!teacher) {
      return NextResponse.json({ message: "Teacher not found" }, { status: 404 });
    }

    return NextResponse.json(teacher.notices, { status: 200 });

  } catch (error) {
    console.error("Error fetching teacher notices:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
