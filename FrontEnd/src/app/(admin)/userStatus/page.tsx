"use client";
import React, { useEffect, useRef, useState } from "react";
import UserCard from "./userCard";
import Link from "next/link";

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

export default function userStatus() {
  const [onlineUsers, setOnlineUsers] = useState(null);
  const [allUsers, setAllUsers] = useState<any[] | null>(null);
  const socket = useRef<WebSocket | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  async function fetchAllUsers() {
    let response;
    try {
      response = await fetch("http://g6-backend:4000/api/admins/get/users", {
        credentials: "include",
      });

      const parsedResponse = await response.json();

      if (!parsedResponse.ok) {
        return;
      }

      setAllUsers(parsedResponse.data);
    } catch (error) {
      console.log(error);
    }
  }

  function configureWebSocket() {
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      socket.current.close();
      socket.current = null;
    }

    const newSocket = new WebSocket("ws://localhost:4000");

    newSocket.onerror = () => {
      console.log("error plz handle");
    };

    newSocket.onopen = () => {
      console.log("WebSocket connection established");
      newSocket.send(JSON.stringify({ type: "initSessionsChange" }));
    };

    newSocket.onclose = () => {
      console.log("WebSocket connection terminated");
    };

    newSocket.onmessage = (event) => {
      let parsed;

      try {
        parsed = JSON.parse(event.data as string);
      } catch (error) {
        console.log("Data not JSON");
        return;
      }

      switch (parsed.type) {
        case "userSessions":
          setOnlineUsers(parsed.data);
          break;

        default:
          break;
      }
    };

    socket.current = newSocket;
  }

  useEffect(() => {
    async function fetchData() {
      await fetchAllUsers();
      configureWebSocket();
    }
    fetchData();
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

    fetchUser();

    return () => {
      if (socket.current && socket.current.readyState === WebSocket.OPEN) {
        socket.current.close();
        socket.current = null;
      }
    };
  }, []);

  // function showAllUsers() {
  //   console.log(allUsers);
  // }

  // function showOnlineUsers() {
  //   console.log(onlineUsers);
  // }

  // If currentUser is null or not ADMIN, show permission message
  if (!currentUser || currentUser.role !== "ADMIN") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-t from-palette1 via-palette3 via-90% to-palette5">
        <div className="text-center text-white text-2xl">
          You do not have permission to access this page. <br />
          <Link href="/" className="text-palette1 underline">
            Click here to go back to the homepage.
          </Link>
        </div>
      </main>
    );
  }

  // Render content for admin users
  return (
    <div className="min-h-screen  bg-gradient-to-t from-palette1 via-palette3 via-90% to-palette5">
      <div className="flex-grow flex justify-end items-center gap-5 mr-5 pt-3 top-0 z-50 sticky">
        <Link href="/" className="text-palette1 hover:underline">
          Homepage
        </Link>
        <Link href="/live" className="text-palette1 hover:underline">
          Live
        </Link>
        <Link href="/feeling" className="text-palette1 hover:underline">
          Feeling
        </Link>
        <Link
          href="/pendingMembership"
          className="text-palette1 hover:underline"
        >
          Pending Membership
        </Link>
      </div>
      <div className="flex justify-center text-4xl">User Status</div>
      <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {allUsers &&
          onlineUsers &&
          allUsers.map((user: any) => {
            return (
              <div className="grid grid-cols-6" key={user.id}>
                <UserCard user={user} onlineUsers={onlineUsers} />
              </div>
            );
          })}
      </div>

      {/* <div className="pt-6">
        <button onClick={showAllUsers}>All Users</button>
        <br />
        <button onClick={showOnlineUsers}>Online Users</button>
      </div> */}
    </div>
  );
}
