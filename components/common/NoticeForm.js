"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateNotice({ teacherId, teacherName }) {
  const [noticeText, setNoticeText] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter(); // Use for redirection

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!noticeText.trim()) {
      setMessage('Please enter a valid notice');
      return;
    }

    try {
      const response = await fetch('/api/notices/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId, noticeText }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage('Notice added successfully!');
        setNoticeText('');
        
        // Redirect to notices page
        setTimeout(() => router.push('/notices'), 1500); 
      } else {
        setMessage(result.error || 'Failed to add notice');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Add any Notice {teacherName}</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full p-2 border rounded"
          rows="5"
          value={noticeText}
          onChange={(e) => setNoticeText(e.target.value)}
          placeholder="Enter your notice here..."
        />
        <button type="submit" className="mt-4 p-2 bg-blue-500 text-white rounded">
          Submit Notice
        </button>
      </form>
      {message && <p className="mt-4 text-green-500">{message}</p>}
    </div>
  );
}
