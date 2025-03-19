"use client";
import CommonForm from "@/components/common/form";
import { Fragment, useState } from "react";
import { searchControls } from "@/util";
import classes from './page.module.css';
import { Frown } from "lucide-react";
import Table from "@/components/common/table";

function StudentPanel() {
    const [teachers, setTeachers] = useState([]);
    const [noResults, setNoResults] = useState(false);

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
            <Table teachers= {teachers}/>
            
        </Fragment>
    );
}

export default StudentPanel;
