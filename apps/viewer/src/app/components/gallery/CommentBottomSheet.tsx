"use client";

import { X, Send } from "lucide-react";
import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CommentBottomSheet({
  open,
  onClose,
}: Props) {
  const [comments, setComments] = useState([
    {
      id: 1,
      name: "Aman",
      text: "Beautiful ❤️",
    },
    {
      id: 2,
      name: "Priya",
      text: "Amazing 😍",
    },
  ]);

  const [message, setMessage] = useState("");

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-[1000] flex items-end bg-black/40">

      <div className="w-full rounded-t-3xl bg-white p-5">

        <div className="mb-5 flex items-center justify-between">

          <h2 className="text-lg font-bold">
            Comments ({comments.length})
          </h2>

          <button onClick={onClose}>
            <X />
          </button>

        </div>

        <div className="mb-5 max-h-72 space-y-3 overflow-y-auto">

          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-2xl bg-gray-100 p-3"
            >
              <p className="font-semibold">
                {comment.name}
              </p>

              <p className="text-sm text-gray-600">
                {comment.text}
              </p>
            </div>
          ))}

        </div>

        <div className="flex gap-2">

          <input
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            placeholder="Write a comment..."
            className="flex-1 rounded-xl border px-4 py-3"
          />

          <button
            onClick={() => {
              if (!message.trim()) return;

              setComments((prev) => [
                ...prev,
                {
                  id: Date.now(),
                  name: "Guest",
                  text: message,
                },
              ]);

              setMessage("");
            }}
            className="rounded-xl bg-amber-600 px-4 text-white"
          >
            <Send size={18} />
          </button>

        </div>

      </div>

    </div>
  );
}