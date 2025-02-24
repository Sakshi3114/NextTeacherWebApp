"use client";
import { Fragment } from "react";

function Table({teachers}){
    return(
        <Fragment>
            {teachers.length > 0 && (
                <div className="m-6 ">
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Fragment>
    );
}


export default Table;