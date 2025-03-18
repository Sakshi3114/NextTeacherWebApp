"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import styles from './form.module.css'

function CommonForm({formControls,onAddData, initialValues}) {
    const inputRefs = useRef({});

    useEffect(() => {
        if (initialValues) {
            formControls.forEach((controlItem) => {
                if (inputRefs.current[controlItem.name]) {
                    inputRefs.current[controlItem.name].value = initialValues[controlItem.name] || "";
                }
            });
        }
    }, [initialValues]);

    function submitHandler(event) {
        event.preventDefault(); 

        const formData = {};

        formControls.forEach((controlItem) => {
            formData[controlItem.name] = inputRefs.current[controlItem.name]?.value || "";
        });

        onAddData(formData);
    }

    return (
        <form  onSubmit={submitHandler} >
            <div className="flex flex-col gap-3">
                {
                    formControls.map(controlItem=>
                        <div className = 'grid w-full gap-1.5 ' key = {controlItem.name}>
                            <Label className="mb-1" >{controlItem.label}</Label>
                            <Input 
                                name = {controlItem.name}
                                placeholder = {controlItem.placeholder}
                                id= {controlItem.name}
                                type = {controlItem.type}
                                ref={(el) => (inputRefs.current[controlItem.name] = el)}
                                
                    />
                        </div>)
                }
            </div>
            <Button type = "submit" className={styles.btn}>{'Submit'}</Button>
        </form>
    );
}

export default CommonForm;


