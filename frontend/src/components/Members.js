import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Members() {
    const [members, setMembers] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMembers = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('You must be logged in to view this page.');
                return;
            }

            try {
                const response = await axios.get('http://localhost:8000/users/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setMembers(response.data);
            } catch (err) {
                setError('You do not have permission to view this page.');
                console.error('Error fetching members:', err);
            }
        };

        fetchMembers();
    }, []);

    if (error) {
        return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg" role="alert">{error}</div>;
    }

    return (
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg w-full max-w-4xl">
            <h3 className="text-3xl font-bold mb-4 text-gray-800">Gym Members</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="py-3 px-4 text-left">ID</th>
                            <th className="py-3 px-4 text-left">Email</th>
                            <th className="py-3 px-4 text-left">Role</th>
                            <th className="py-3 px-4 text-left">Active</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map((member) => (
                            <tr key={member.id} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-4">{member.id}</td>
                                <td className="py-3 px-4">{member.email}</td>
                                <td className="py-3 px-4">{member.role}</td>
                                <td className="py-3 px-4">{member.is_active ? 'Yes' : 'No'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Members;