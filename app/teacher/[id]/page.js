"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from './page.module.css';

function TeacherDetails() {
    const { id } = useParams(); // Get dynamic ID
    const router = useRouter();
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeacher = async () => {
            try {
                const response = await fetch(`/api/records/${id}`);
                if (!response.ok) throw new Error("Failed to fetch teacher");
                const data = await response.json();
                setTeacher(data);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTeacher();
    }, [id]);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this record?")) return;

        try {
            const response = await fetch(`/api/records/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete record");

            alert("Teacher record deleted successfully!");
            router.push("/admin/retrieveall");
        } catch (error) {
            console.error("Error:", error);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!teacher) return <p>Teacher not found.</p>;

    return (
        <div className={styles.container}>
            <div className = {styles.card}>
            <h1 className="text-2xl font-bold mb-4">{teacher.name}</h1>
            <p><strong>Number:</strong> {teacher.number}</p>
            <p><strong>Email:</strong> {teacher.email}</p>
            <p><strong>Department:</strong> {teacher.department}</p>

            <div className="mt-4">
                <button onClick={() => router.push(`/admin/edit/${id}`)} className="bg-yellow-500 text-white px-4 py-2 rounded mr-2">
                    Edit
                </button>
                <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded">
                    Delete
                </button>
            </div>
            </div>
            
        </div>
    );
}

export default TeacherDetails;
