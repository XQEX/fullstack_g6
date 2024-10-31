"use client";
import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { Pen } from "lucide-react";
import "dotenv/config";

interface UserFeel {
  id: number;
  pixelian_name: string;
  feeling: string;
  date: Date;
}

// Sample data
const userFeelings = [
  {
    id: 1,
    pixelian_name: "Alice",
    feeling: "I love u Beta AMI",
    date: new Date("2024-10-01"),
  },
  {
    id: 2,
    pixelian_name: "Bob",
    feeling: "I'm your fan for 10 years",
    date: new Date("2024-09-25"),
  },
  {
    id: 3,
    pixelian_name: "Charlie",
    feeling: "I always enjoy watching your stream",
    date: new Date("2024-10-05"),
  },
  {
    id: 4,
    pixelian_name: "Diana",
    feeling: "You are the best streamer",
    date: new Date("2024-09-30"),
  },
];

export const EnvelopeCard: React.FC<{
  feeling: UserFeel;
  Role: "ADMIN" | "USER";
  currentUserName: string; // New prop to identify the current user
  onDelete: (id: number) => void; // Update the delete function to accept an ID
}> = ({ feeling, Role, currentUserName, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedFeeling, setEditedFeeling] = useState(feeling.feeling);

  async function handleEdit(id: number) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const res = await fetch(
      `http://${process.env.WEB_HOST}:4000/api/feelings/edit/` + id,
      {
        next: {
          revalidate: 0,
        },
        credentials: "include",
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...feeling, feeling: editedFeeling }), // Send the updated feeling
      }
    );

    if (!res.ok) {
      return;
    }
    setIsEditing(false); // Close the edit mode
  }

  return (
    <div className="envelope-container" onClick={() => setIsOpen(!isOpen)}>
      <div className={`envelope ${isOpen ? "open" : ""}`}>
        <div className="front">
          <div className="flap"></div>
        </div>
        <div className="back"></div>
        <div className="letter">
          <h3 className="font-bold text-xl text-gray-800 mb-2">
            {feeling.pixelian_name}
          </h3>

          {isEditing ? (
            <div>
              <textarea
                value={editedFeeling}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onChange={(e) => setEditedFeeling(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-black"
              />
              <button
                onClick={(e) => handleEdit(feeling.id)}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="mt-2 ml-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <p className="text-gray-700 italic">"{feeling.feeling}"</p>
              <div className="mt-2 text-gray-500 text-sm">
                {/* Display the date if needed */}
                {/* {feeling.date.toLocaleDateString()} */}
              </div>

              {/* Show delete button for admins and the user who created the feeling */}
              {(Role === "ADMIN" ||
                feeling.pixelian_name === currentUserName) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(feeling.id); // Pass the feeling ID to the delete function
                  }}
                  className="mt-2 text-red-600 hover:text-red-800 transition-colors hover:underline"
                  aria-label={`Delete feeling by ${feeling.pixelian_name}`}
                >
                  Delete
                </button>
              )}
              {feeling.pixelian_name === currentUserName && (
                <Pen
                  className="absolute top-0 right-0 hover:cursor-pointer fill-black"
                  onClick={(e) => {
                    setIsEditing(true);
                    e.stopPropagation();
                  }} // Enter edit mode
                ></Pen>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
