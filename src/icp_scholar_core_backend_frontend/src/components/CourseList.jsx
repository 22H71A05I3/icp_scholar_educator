import React, { useEffect, useState } from "react";
import { backend } from "../backend/backend"; // import actor

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState("");

  const fetchCourses = async () => {
    try {
      const result = await backend.get_all_courses();
      setCourses(result);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnroll = async (id) => {
    try {
      const res = await backend.enroll_course(id);
      setMessage(res);
    } catch (err) {
      setMessage("Enrollment failed.");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">All Courses</h2>
      {message && <p className="mb-4 text-green-600">{message}</p>}
      <ul className="space-y-4">
        {courses.map((course) => (
          <li key={course.id} className="p-4 bg-white shadow rounded">
            <h3 className="text-lg font-bold">{course.title}</h3>
            <p className="text-gray-600">{course.description}</p>
            <button
              onClick={() => handleEnroll(course.id)}
              className="mt-2 bg-green-600 text-white px-3 py-1 rounded"
            >
              Enroll
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CourseList;
