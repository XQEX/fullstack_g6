"use client";
import Image from "next/image";
import Link from "next/link";
import Navbar from "./components/Navbar";
import Animation from "./components/Animation"; // Fix: Corrected the component name
import { useEffect, useState } from "react";

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
export default function Homepage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/users/info", {
          credentials: "include",
        });
        const data = await res.json();
        setCurrentUser(data.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, [currentUser]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex flex-col">
        <section className="flex-grow flex items-center justify-center bg-gradient-to-t from-palette1 via-palette3 via-40% to-palette5">
          <div className="container px-4 md:px-6">
            <Animation />
          </div>
        </section>

        <section className="bg-palette1 py-16">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-2xl font-bold mb-8 text-center text-gray-700 select-none">
              Explore PixelaFans
            </h2>

            <div
              className={"grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}
            >
              <Link
                href="/portfolio"
                className="text-white transition ease-in-out delay-80 hover:-translate-y-1 hover:scale-105 duration-300"
              >
                <div className="bg-palette2 p-6 rounded-lg shadow-md select-none hover:cursor-pointer">
                  <h3 className="text-xl font-semibold mb-4 text-gray-700">
                    Portfolio
                  </h3>
                  <p className="text-gray-600">
                    Know more about our favorite VTubers
                  </p>
                </div>
              </Link>

              <div
                className={`transition ease-in-out delay-80 hover:-translate-y-1 hover:scale-105 duration-300 ${
                  !currentUser ? "pointer-events-none opacity-50" : ""
                }`}
              >
                <Link href={currentUser ? "/live" : "#"} className="text-white">
                  <div className="bg-palette2 p-6 rounded-lg shadow-md select-none">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">
                      Live
                    </h3>
                    <p className="text-gray-600">Watch your favorite VTubers</p>
                  </div>
                </Link>
              </div>

              <div
                className={`transition ease-in-out delay-80 hover:-translate-y-1 hover:scale-105 duration-300 ${
                  !currentUser ? "pointer-events-none opacity-50" : ""
                }`}
              >
                <Link
                  href={currentUser ? "/feeling" : "#"}
                  className="text-white"
                >
                  <div className="bg-palette2 p-6 rounded-lg shadow-md select-none">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">
                      Feeling
                    </h3>
                    <p className="text-gray-600">
                      Send your feeling to your favorite Vtuber
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
    // </Context.Provider>
  );
}
