"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthForms() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/auth-forms/login' : '/api/auth-forms/register';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (response.ok) {
        alert(result.message);
        if (isLogin) {
            const {teacherId, teacherName} = result;
            router.push(`/create-notice?_id=${teacherId}&name=${encodeURIComponent(teacherName)}`);
        }
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-md rounded-md">
        <h2 className="text-2xl font-bold text-center">{isLogin ? 'Teacher Login' : 'Teacher Registration'}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label className="block mb-1">Name</label>
              <input type="text" name="name" onChange={handleChange} className="w-full p-2 border rounded" required />
            </div>
          )}
          <div>
            <label className="block mb-1">Email</label>
            <input type="email" name="email" onChange={handleChange} className="w-full p-2 border rounded" required />
          </div>
          <div>
            <label className="block mb-1">Password</label>
            <input type="password" name="password" onChange={handleChange} className="w-full p-2 border rounded" required />
          </div>
          <button type="submit" className="w-full mt-4 p-2 bg-blue-500 text-white rounded">{isLogin ? 'Login' : 'Register'}</button>
        </form>
        <p className="text-center mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button className="text-blue-500" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}
