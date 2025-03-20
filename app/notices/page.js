"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function NoticesPage() {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [notices, setNotices] = useState([]);
  const router = useRouter();

  // Fetch all teachers on component mount
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await fetch('/api/teachers');
        const data = await response.json();
        setTeachers(data);
      } catch (error) {
        console.error('Error fetching teachers:', error);
      }
    };

    fetchTeachers();
  }, []);

  // Fetch notices when a teacher is selected
  const fetchNotices = async (teacherId) => {
    if (!teacherId) {
        console.error('Invalid teacherId:', teacherId);
        return;
      }
      try {
        const response = await fetch(`/api/teachers/${teacherId}`); // teacherId directly in the API call
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setNotices(data);
        const selected = teachers.find((teacher) => teacher._id === teacherId);
        setSelectedTeacher(selected);
      } catch (error) {
        console.error('Error fetching notices:', error);
      }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-1/4 p-4 bg-gray-100 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Teachers</h2>
        {teachers.map((teacher) => (
          <button
            key={teacher._id}
            onClick={() => fetchNotices(teacher._id)}
            className={`block w-full text-left p-2 rounded mb-2 ${selectedTeacher?._id === teacher._id ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            {teacher.name}
          </button>
        ))}
      </aside>

      {/* Notices Section */}
      <main className="flex-1 p-6 overflow-y-auto">
        {selectedTeacher ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">Notices by {selectedTeacher.name}</h2>
            {notices.length > 0 ? (
              notices.map((notice) => (
                <div key={notice._id} className="mb-4 p-4 border rounded shadow-md">
                  <p className="text-sm text-gray-500">Issued on: {new Date(notice.createdAt).toLocaleString()}</p>
                  <p className="text-lg">{notice.text}</p>
                </div>
              ))
            ) : (
              <p>No notices available.</p>
            )}
          </div>
        ) : (
          <p>Select a teacher to view notices.</p>
        )}
      </main>
    </div>
  );
}
