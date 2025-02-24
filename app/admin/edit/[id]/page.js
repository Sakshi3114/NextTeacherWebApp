"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import CommonForm from "@/components/common/form";
import { formControls } from "@/util";

function EditRecord() {
    const { id } = useParams(); // Get dynamic ID from URL
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
                console.error("Error fetching teacher:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTeacher();
    }, [id]);

    const handleUpdate = async (updatedData) => {
        try {
            const response = await fetch(`/api/records/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) throw new Error("Failed to update record");

            alert("Teacher record updated successfully!");
            router.push("/admin/retrieveall"); // Redirect after update
        } catch (error) {
            console.error("Error updating record:", error);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!teacher) return <p>Teacher not found.</p>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Edit Teacher Record</h1>
            <CommonForm
                formControls={formControls}
                onAddData={handleUpdate}
                initialValues={teacher} // Prefill form
            />
        </div>
    );
}

export default EditRecord;
