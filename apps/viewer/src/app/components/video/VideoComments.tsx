"use client";

import { X, Heart, Send } from "lucide-react";
import { useState } from "react";


type Props = {
  open: boolean;
  onClose: () => void;
};

const comments = [
  {
    id: 1,
    user: "Aman",
    text: "Beautiful memories ❤️",
    likes: 24,
  },
  {
    id: 2,
    user: "Priya",
    text: "Congratulations 🎉",
    likes: 15,
  },
  {
    id: 3,
    user: "Rahul",
    text: "Amazing wedding film 😍",
    likes: 9,
  },
];

export default function VideoComments({
  open,
  onClose,
}: Props) {
  const [message, setMessage] = useState("");

  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[998] bg-black/50"
      />

      <div className="fixed bottom-0 left-0 right-0 z-[999] rounded-t-[32px] bg-white shadow-2xl">

        <div className="mx-auto mt-3 h-1.5 w-14 rounded-full bg-gray-300" />

        <div className="flex items-center justify-between px-6 py-5">

          <h2 className="text-lg font-bold">
            Comments
          </h2>

          <button onClick={onClose}>
            <X size={22} />
          </button>

        </div>

        <div className="max-h-[50vh] overflow-y-auto px-6">

          {comments.map((item) => (
            <div
              key={item.id}
              className="mb-5 flex gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 font-bold text-white">
                {item.user.charAt(0)}
              </div>

              <div className="flex-1">

                <h4 className="font-semibold">
                  {item.user}
                </h4>

                <p className="mt-1 text-sm text-gray-600">
                  {item.text}
                </p>

                <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                  <Heart
                    size={14}
                    className="fill-red-500 text-red-500"
                  />
                  {item.likes}
                </div>

              </div>

            </div>
          ))}

        </div>

        <div className="flex items-center gap-3 border-t p-5">

          <input
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            placeholder="Write a comment..."
            className="flex-1 rounded-full border px-5 py-3 outline-none focus:border-red-400"
          />

          <button className="rounded-full bg-red-500 p-3 text-white">
            <Send size={18} />
          </button>

        </div>

      </div>
    </>
  );
}