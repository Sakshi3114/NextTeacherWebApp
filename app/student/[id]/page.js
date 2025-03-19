"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from './page.module.css';

function TeacherDetailsStudent() {
    const { id } = useParams(); // Get dynamic ID
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


    if (loading) return <p>Loading...</p>;
    if (!teacher) return <p>Teacher not found.</p>;

    return (
        <div className={styles.container}>
            <div className = {styles.card}>
                <h1 className="text-2xl font-bold mb-4">{teacher.name}</h1>
                <p><strong>Number:</strong> {teacher.number}</p>
                <p><strong>Email:</strong> {teacher.email}</p>
                <p><strong>Department:</strong> {teacher.department}</p>
            </div>
        </div>
    );
}

export default TeacherDetailsStudent;
