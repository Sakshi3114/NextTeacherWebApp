import dbConnect from "@/lib/dbConnect"; 
import Teacher from "@/models/teacher";  
import {NextResponse } from "next/server";

export async function POST(req) {
    await dbConnect(); 
        try {
            const data = await req.json();

            const newTeacher = new Teacher({
                name: data.name,   
                number: data.number,
                email: data.email,
                department: data.department,
                lecture1: data.lecture1 || "",
                lecture2: data.lecture2 || "",
                lecture3: data.lecture3 || "",
                lecture4: data.lecture4 || "",
                lecture5: data.lecture5 || "",
                lecture6: data.lecture6 || "",
                lecture7: data.lecture7 || "",
                lecture8: data.lecture8 || "",
            });

            const result = await newTeacher.save();

            return NextResponse.json({ message: "Data Inserted.", insertedId: result._id }, { status: 201 });


        } catch (error) {
            console.error("Error inserting data:", error);

            return NextResponse.json({ message: "Database insertion failed", error }, { status: 500 });
        }


    // return res.status(405).json({ message: "Method Not Allowed" });
}

//GET route

export async function GET() {
    await dbConnect();
    try {
        const teachers = await Teacher.find({});
        return NextResponse.json(teachers, { status: 200 });
    } catch (error) {
        console.error("Error fetching teachers:", error);
        return NextResponse.json({ message: "Failed to fetch teachers", error }, { status: 500 });
    }
}