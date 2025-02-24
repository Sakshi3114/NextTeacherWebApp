import dbConnect from "@/lib/dbConnect";
import Teacher from "@/models/teacher";
import { NextResponse } from "next/server";

export async function POST(req) {
    await dbConnect();

    try {
        const { name, department } = await req.json();
        let query = {};

        if (name) {
            query.name = { $regex: name, $options: "i" }; // Case-insensitive search
        }
        if (department) {
            query.department = { $regex: department, $options: "i" };
        }

        const teachers = await Teacher.find(query);
        return NextResponse.json(teachers, { status: 200 });

    } catch (error) {
        console.error("Error fetching teacher records:", error);
        return NextResponse.json({ message: "Search failed", error }, { status: 500 });
    }
}
