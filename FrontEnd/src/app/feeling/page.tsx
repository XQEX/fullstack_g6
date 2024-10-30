"use client";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import VtubeFeelingList from "./VtubeFeelingList";

interface User {
  isOauth: boolean;
  id: string;
  name: string;
  email: string;
  profile_picture: string;
  favorite_vtuber: string | null;
  role: "ADMIN" | "USER";
  createdAt: string;
  updatedAt: string;
}

export default function Portfolio() {
  const [vtubers, setVtubers] = useState([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [IsFetching, setIsFetching] = useState(true);

  // Fetch vtuber data on component mount
  useEffect(() => {
    setIsFetching(true);
    const fetchVtubers = async () => {
      try {
        const vtubersData = await fetch(
          "http://g6-backend:4000/api/vtubers/get"
        ); // Adjust the API route as needed
        const result = await vtubersData.json();
        setVtubers(result.data);
      } catch (error) {
        console.error("Error fetching vtubers data:", error);
      }
    };

    const fetchUser = async () => {
      try {
        const res = await fetch("http://g6-backend:4000/api/users/info", {
          credentials: "include",
        });
        const data = await res.json();
        setCurrentUser(data.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    async function fetchdata() {
      await fetchUser();
      await fetchVtubers();
      setIsFetching(false);
    }
    fetchdata();
  }, []);

  return (
    <div className="relative ">
      <Navbar />
      {currentUser ? (
        <main className="min-h-screen bg-gradient-to-t from-palette1 via-palette3 via-90% to-palette5">
          <div className="flex justify-center items-center">
            <p className="font-bold text-white text-3xl">FEELINGS</p>
          </div>
          <div className="flex justify-center">
            send message to your favorite Vtuber
          </div>
          <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-6 ml-6">
            <VtubeFeelingList vtubers={vtubers} currentUser={currentUser} />
          </div>
        </main>
      ) : !IsFetching ? (
        <div className="h-screen bg-gradient-to-t from-palette1 via-palette3 via-90% to-palette5 flex items-center justify-center">
          <div className="text-4xl">You have to login to see content.</div>
        </div>
      ) : (
        <div className="h-screen bg-gradient-to-t from-palette1 via-palette3 via-90% to-palette5 flex items-center justify-center">
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-16 h-16 border-4 border-white border-t-transparent border-solid rounded-full animate-spin"></div>
          </div>
        </div>
      )}
    </div>
  );
}
