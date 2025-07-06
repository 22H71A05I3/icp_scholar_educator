import React, { useState } from "react";
import { backend } from "../backend/backend";

const CreateCourseForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await backend.create_course(title, description);
      setMessage(res);
      setTitle("");
      setDescription("");
    } catch (err) {
      console.error(err);
      setMessage("Failed to create course.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Create a New Course</h2>
      <form onSubmit={handleCreate} className="space-y-4">
        <input
          type="text"
          placeholder="Course Title"
          className="w-full p-2 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Course Description"
          className="w-full p-2 border rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded w-full"
        >
          Create Course
        </button>
      </form>
      {message && <p className="mt-4 text-center text-green-600">{message}</p>}
    </div>
  );
};

export default CreateCourseForm;
