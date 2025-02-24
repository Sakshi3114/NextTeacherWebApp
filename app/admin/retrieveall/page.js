"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function RetrieveAll() {
    const [teachers, setTeachers] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const response = await fetch("/api/records"); // Fetch all records
                if (!response.ok) throw new Error("Failed to fetch data");
                const data = await response.json();
                setTeachers(data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchTeachers();
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Retrieve All Records</h1>
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border border-gray-300 p-2">Name</th>
                        <th className="border border-gray-300 p-2">Department</th>
                        <th className="border border-gray-300 p-2">Lecture 1</th>
                        <th className="border border-gray-300 p-2">Lecture 2</th>
                        <th className="border border-gray-300 p-2">Lecture 3</th>
                        <th className="border border-gray-300 p-2">Lecture 4</th>
                        <th className="border border-gray-300 p-2">Lecture 5</th>
                        <th className="border border-gray-300 p-2">Lecture 6</th>
                        <th className="border border-gray-300 p-2">Lecture 7</th>
                        <th className="border border-gray-300 p-2">Lecture 8</th>

                        <th className="border border-gray-300 p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {teachers.map((teacher) => (
                        <tr key={teacher._id} className="text-center hover:bg-gray-100">
                            <td className="border border-gray-300 p-2">{teacher.name}</td>
                            <td className="border border-gray-300 p-2">{teacher.department}</td>
                            <td className="border border-gray-300 p-2">{teacher.lecture1}</td>
                            <td className="border border-gray-300 p-2">{teacher.lecture2}</td>
                            <td className="border border-gray-300 p-2">{teacher.lecture3}</td>
                            <td className="border border-gray-300 p-2">{teacher.lecture4}</td>
                            <td className="border border-gray-300 p-2">{teacher.lecture5}</td>
                            <td className="border border-gray-300 p-2">{teacher.lecture6}</td>
                            <td className="border border-gray-300 p-2">{teacher.lecture7}</td>
                            <td className="border border-gray-300 p-2">{teacher.lecture8}</td>

                            <td className="border border-gray-300 p-2">
                                <button
                                    onClick={() => router.push(`/teacher/${teacher._id}`)}
                                    className="bg-blue-500 text-white px-3 py-1 rounded"
                                >
                                    View
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default RetrieveAll;
