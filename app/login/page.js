"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const ADMIN_PASSWORD = "admin@123"; // Dummy hardcoded password

export default function AdminLogin() {
    const [role, setRole] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    function handleLogin(event) {
        event.preventDefault();

        if (password === ADMIN_PASSWORD) {
            router.push("/admin"); // Redirect to admin home page
        } else {
            setError("Incorrect password. Please try again.");
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="bg-gray-50 p-6 rounded-lg shadow-lg w-80">
                <h2 className="text-2xl font-bold text-center mb-4">Admin Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <Label htmlFor="role">Role</Label>
                        <Input
                            id="role"
                            type="text"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder="Enter your role"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                    <Button type="submit" className="w-full hover:bg-black hover:text-white">Login</Button>
                </form>
            </div>
        </div>
    );
}
