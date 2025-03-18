import dbConnect from "@/lib/dbConnect";
import Teacher from "@/models/teacher";
import { NextResponse } from "next/server";

// GET a single teacher by ID
export async function GET(req, { params }) {
    await dbConnect();
    try {
        if(!params || !params.id){
            return NextResponse.json({message: "Invalid request"}, {status: 400});
        }
        const teacher = await Teacher.findById(params.id);

        if (!teacher) return NextResponse.json({ message: "Teacher not found" }, { status: 404 });

        return NextResponse.json(teacher, { status: 200 });
    } catch (error) {
        console.error("Error fetching teacher:", error);
        return NextResponse.json({ message: "Error fetching teacher", error }, { status: 500 });
    }
}

// DELETE a teacher by ID
export async function DELETE(req, { params }) {
    await dbConnect();
    try {
        const deletedTeacher = await Teacher.findByIdAndDelete(params.id);
        if (!deletedTeacher) return NextResponse.json({ message: "Teacher not found" }, { status: 404 });

        return NextResponse.json({ message: "Teacher deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting teacher:", error);
        return NextResponse.json({ message: "Error deleting teacher", error }, { status: 500 });
    }
}

//Edit Teachers Details
export async function PUT(req, { params }) {
    await dbConnect();
    try {
        const updatedData = await req.json();

        const updatedTeacher = await Teacher.findByIdAndUpdate(params.id, updatedData, { new: true });

        if (!updatedTeacher) return NextResponse.json({ message: "Teacher not found" }, { status: 404 });

        return NextResponse.json(updatedTeacher, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Internal server error", error }, { status: 500 });
    }
}