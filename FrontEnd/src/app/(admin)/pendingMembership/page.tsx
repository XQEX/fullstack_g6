"use client";
import React, { useEffect, useRef, useState } from "react";
import UserCard from "./userCard";
import Link from "next/link";

interface membershipProof {
  id: string;
  name: string;
  profile_picture: string | null;
  membership_proof_image: string;
}
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

export default function admin() {
  const [pendingMembershipProof, setpendingMembershipProof] = useState<
    membershipProof[] | null
  >(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const socket = useRef<WebSocket | null>(null);

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
      newSocket.send(JSON.stringify({ type: "initIncomingMembershipProof" }));
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
        case "pendingMembershipProof":
          //   console.log(parsed.data);
          setpendingMembershipProof(parsed.data);
          //   onlineUsers = parsed.data;
          //   console.log(onlineUsers);
          break;

        default:
          break;
      }
    };

    socket.current = newSocket;
  }

  useEffect(() => {
    async function fetchData() {
      configureWebSocket();
    }
    fetchData();
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

    return () => {
      if (socket.current && socket.current.readyState === WebSocket.OPEN) {
        socket.current.close();
        socket.current = null;
      }
    };
  }, []);

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

  return (
    <div className="min-h-screen  bg-gradient-to-t from-palette1 via-palette3 via-90% to-palette5">
      <div className=" flex-grow  flex justify-end items-center gap-5 mr-5 pt-3 top-0 z-50 sticky">
        <Link href="/" className="text-palette1 hover:underline">
          Homepage
        </Link>
        <Link href="/live" className="text-palette1 hover:underline">
          Live
        </Link>
        <Link href="/feeling" className="text-palette1 hover:underline">
          feeling
        </Link>
        <Link href="/userStatus" className="text-palette1 hover:underline">
          User Status
        </Link>
      </div>
      <div className="mb-6">
        <h4 className="text-3xl flex justify-center">
          Pending Membership Tier Requests
        </h4>
      </div>
      <div>
        {pendingMembershipProof &&
          pendingMembershipProof.length !== 0 &&
          pendingMembershipProof.map((userProof) => {
            return (
              <UserCard
                key={userProof.id}
                id={userProof.id}
                name={userProof.name}
                profile_picture={userProof.profile_picture}
                imgsrc={userProof.membership_proof_image}
              />
            );
          })}
      </div>
    </div>
  );
}
