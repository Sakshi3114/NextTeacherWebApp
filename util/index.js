import { Plus, Pencil, UserX, UserRoundCheck } from "lucide-react";

export const cardData = [
    {
        heading: "Add Details",
        icon: <Plus size={40} />,
        buttonText: "Add a new record",
        operation: 'add'
    },
    // {
    //     heading: "Edit Details",
    //     icon: <Pencil size={40} />,
    //     buttonText: "Edit a record",
    //     operation: 'edit'
    // },
    {
        heading: "Retrieve All",
        icon: <UserRoundCheck size={40} />,
        buttonText: "Retrieve All Records",
        operation: 'retrieveall'
    },
    {
        heading: "Retrieve Any",
        icon: <UserRoundCheck size={40} />,
        buttonText: "Retrieve record",
        operation: 'retrieve'
    },
];

export const formControls = [
    {
        label: "Name",
        name: "name",
        componentType: "input",
        type: "text",
        placeholder: "Enter teacher's name",
    },
    {
        label: "Phone Number",
        name: "number",
        componentType: "input",
        type: "phone",
        placeholder: "Enter teacher's phone",
    },
    {
        label: "Email",
        name: "email",
        componentType: "input",
        type: "email",
        placeholder: "Enter teacher's email",
    },
    {
        label:'Department',
        name:'department',
        componentType:'input',
        placeholder:'Enter the department of the teacher',
    },
    {
        label: "Lecture1",
        name: "lecture1",
        componentType: "input",
        type: "text",
        placeholder: "Enter the lecture room",
    },
    {
        label: "Lecture2",
        name: "lecture2",
        componentType: "input",
        type: "text",
        placeholder: "Enter the lecture room",
    },
    {
        label: "Lecture3",
        name: "lecture3",
        componentType: "input",
        type: "text",
        placeholder: "Enter the lecture room",
    },
    {
        label: "Lecture4",
        name: "lecture4",
        componentType: "input",
        type: "text",
        placeholder: "Enter the lecture room",
    },
    {
        label: "Lecture5",
        name: "lecture5",
        componentType: "input",
        type: "text",
        placeholder: "Enter the lecture room",
    },
    {
        label: "Lecture6",
        name: "lecture6",
        componentType: "input",
        type: "text",
        placeholder: "Enter the lecture room",
    },
    {
        label: "Lecture7",
        name: "lecture7",
        componentType: "input",
        type: "text",
        placeholder: "Enter the lecture room",
    },
    {
        label: "Lecture8",
        name: "lecture8",
        componentType: "input",
        type: "text",
        placeholder: "Enter the lecture room",
    },


]

export const searchControls = [
    {
        label: "Name",
        name: "name",
        componentType: "input",
        type: "text",
        placeholder: "Enter teacher's name",
    },
    {
        label:'Department',
        name:'department',
        componentType:'input',
        placeholder:'Enter the department of the teacher',
    },
]
