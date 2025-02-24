"use client";
import CommonForm from "@/components/common/form";
import { formControls } from "@/util";
import classes from './page.module.css';
import { Fragment } from "react";
import { useRouter } from "next/navigation";

function AddNew(){
    const router = useRouter();

    async function addNewRecord(enteredData) {
        console.log(enteredData);

        const response = await fetch("http://localhost:3000/api/records",{
            method: "POST",
            body: JSON.stringify(enteredData), 
            headers: { 
                "Content-Type": "application/json" 
            }, 
        });
        
        const data = await response.json();
        if (response.ok) {
            alert("Record added successfully!");
          } else {
            alert(`Error: ${data.message}`);
          }

        console.log("API Response:", data);
    
        router.push("/admin/retrieveall");
    }
    return(
        <Fragment>
            <h1 className="text-3xl font-bold m-4 text-[#800020] text-center">Add new Teacher record</h1>
            <div className={classes.div} >
                <CommonForm formControls={formControls} onAddData = {addNewRecord}/>
            </div>
        </Fragment>
    );
}

export default AddNew;