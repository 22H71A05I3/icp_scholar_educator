import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { backend } from "../backend/backend";

const FeedbackForm = () => {
  const { courseId } = useParams();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await backend.submit_feedback(BigInt(courseId), rating, comment);
      setMessage(res);
      setComment("");
    } catch (err) {
      console.error(err);
      setMessage("Feedback submission failed.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Submit Feedback</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          className="w-full p-2 border rounded"
          value={rating}
          onChange={(e) => setRating(parseInt(e.target.value))}
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} Star{r > 1 ? "s" : ""}
            </option>
          ))}
        </select>
        <textarea
          placeholder="Write your comments..."
          className="w-full p-2 border rounded"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded w-full"
        >
          Submit Feedback
        </button>
      </form>
      {message && <p className="mt-4 text-green-600 text-center">{message}</p>}
    </div>
  );
};

export default FeedbackForm;
