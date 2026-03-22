"use client";

import { useState } from "react";

export default function CommentsSection() {
  const [comments, setComments] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const handleAdd = () => {
    if (!input.trim()) return;
    setComments([...comments, input]);
    setInput("");
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Comments</h3>

      <div className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 bg-gray-800 rounded"
          placeholder="Write a comment..."
        />
        <button onClick={handleAdd} className="bg-orange-500 px-4 rounded">
          Post
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {comments.map((c, i) => (
          <div key={i} className="bg-gray-800 p-2 rounded">
            {c}
          </div>
        ))}
      </div>
    </div>
  );
}