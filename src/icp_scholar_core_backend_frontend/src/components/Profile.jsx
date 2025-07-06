import React, { useEffect, useState } from "react";
import { backend } from "../backend/backend";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [enrolled, setEnrolled] = useState([]);
  const [completed, setCompleted] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userProfile = await backend.get_user_profile();
        const enrolledCourses = await backend.get_my_enrolled_courses();
        const completedCourses = await backend.get_my_completed_courses();
        setUser(userProfile[0]);
        setEnrolled(enrolledCourses);
        setCompleted(completedCourses);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  if (!user) return <p className="text-center mt-6">Loading profile...</p>;

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">My Profile</h2>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Role:</strong> {user.role}</p>

      <div className="mt-6">
        <h3 className="text-lg font-semibold">Enrolled Courses</h3>
        <ul className="list-disc ml-6">
          {enrolled.map((course) => (
            <li key={course.id}>{course.title}</li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold">Completed Courses</h3>
        <ul className="list-disc ml-6">
          {completed.map((course) => (
            <li key={course.id}>{course.title}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Profile;
