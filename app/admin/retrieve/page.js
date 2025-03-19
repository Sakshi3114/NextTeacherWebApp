"use client";
import CommonForm from "@/components/common/form";
import { Fragment, useState } from "react";
import { searchControls } from "@/util";
import classes from './page.module.css';
import { Frown } from "lucide-react";
import { useRouter } from "next/navigation";

function RetrieveRecord() {
    const [teachers, setTeachers] = useState([]);
    const [noResults, setNoResults] = useState(false);
    const router = useRouter();

    async function searchTeacher(formData) {
        if (!formData.name && !formData.department) {
            alert("Please enter either a Name or Department to search.");
            return;
        }
        try {
            setTeachers([]); 
            setNoResults(false);
            const response = await fetch("/api/records/search", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error("Failed to fetch teacher records");

            const data = await response.json();
            if(data.length == 0){
                setNoResults(true);
            }else{
                setNoResults(false);
                setTeachers(data);
            }          
        } catch (error) {
            console.error("Error fetching teacher records:", error);
        }
    }

    return (
        <Fragment>
            <h1 className="text-2xl font-bold mb-4 text-center mt-4">Retrieve Record</h1>
            <div className={classes.div}>
                <CommonForm 
                    formControls={searchControls} 
                    onAddData={searchTeacher}  // Pass function to handle search
                />
            </div>

            {/* Show "No teacher found" if no results */}
            {noResults && (
                <div className={classes.notFound}>
                    <Frown className={classes.icon}/>
                    No teacher found.
                </div>
            )}

            {/* Display results */}
            {teachers.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-2">Search Results:</h2>
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
            )}
        </Fragment>
    );
}

export default RetrieveRecord;
