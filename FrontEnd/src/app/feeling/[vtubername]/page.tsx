"use client";
import React, { useEffect, useRef, useState } from "react";
import { notFound } from "next/navigation";
// import Navbar from "@/app/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { EnvelopeCard } from "@/app/feeling/EnvelopeCard";
import "dotenv/config";
// import { error } from "console";
// import { count } from "console";

export const dynamicParams = true;

interface Vtuber {
  id: string;
  name: string;
  age: string;
  icon_image: string;
  description: string;
  height: string;
  birthdate: string;
  youtube: string;
  twitter: string;
  discord: string;
  facebook: string;
  port_image: string;
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

export default function page({ params }: { params: { vtubername: string } }) {
  const socket = useRef<WebSocket | null>(null);
  const [userFeelings, setUserFeelings] = useState([] as any[]);
  const [vtuber, setVtuber] = useState<Vtuber | null>(null);
  const [currentFeeling, setCurrentFeeling] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [currentUser, setCurrentUser] = useState<User | null>(null); //user
  const { toast } = useToast();

  async function getVtube(name: string) {
    const res = await fetch(
      `http://${process.env.WEB_HOST}:4000/api/vtubers/get/` + name,
      {
        next: {
          revalidate: 60,
        },
        credentials: "include",
      }
    );

    if (!res.ok) {
      notFound();
    }

    const parsedResponse = await res.json();
    setVtuber(parsedResponse.data);
    return (parsedResponse as any).data.name;
  }

  function configureWebSocket(vtuberName: string) {
    const newSocket = new WebSocket(`ws://${process.env.WEB_HOST}:4000`);
    newSocket.onerror = () => {
      console.log("Error when establishing Websocket");
    };
    newSocket.onopen = () => {
      console.log("WebSocket opened");
      newSocket.send(
        JSON.stringify({ type: "initFeelingsChange", data: vtuberName })
      );
    };
    newSocket.onclose = () => {
      console.log("WebSocket closed");
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
        case `pixelianFeelingsTo${vtuberName}`:
          console.log(parsed.data);
          setUserFeelings(parsed.data as any[]);
          break;
        default:
          break;
      }
    };
  }

  function handleChangeFeeling(feeling: string) {
    setCurrentFeeling(feeling);
  }

  async function postFeeling() {
    if (!vtuber || currentFeeling === "") {
      return;
    }

    setLoading(true); // Start loading state

    try {
      const response = await fetch(
        `http://${process.env.WEB_HOST}:4000/api/feelings/post`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            feeling: currentFeeling,
            vtuber_name: vtuber.name,
          }),
        }
      );

      if (!response.ok) {
        toast({
          description: "Something went wrong",
        });
      } else {
        setCurrentFeeling(""); // Clear the input field after successful post
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false); // End loading state
    }
  }

  useEffect(() => {
    async function fetchData() {
      const vtuberName = await getVtube(params.vtubername);
      configureWebSocket(vtuberName);
    }
    fetchData();
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `http://${process.env.WEB_HOST}:4000/api/users/info`,
          {
            credentials: "include",
          }
        );
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

  async function deleteFeeling(id: string) {
    try {
      console.log(id);
      const response = await fetch(
        `http://${process.env.WEB_HOST}:4000/api/feelings/delete/` + id,
        {
          method: "DELETE",
          // headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        toast({
          description: "Failed to delete feeling",
        });
      } else {
        // Remove the deleted feeling from the local state
        setUserFeelings((prevFeelings) =>
          prevFeelings.filter((feeling) => feeling.id !== id)
        );
      }
    } catch (error) {
      console.log(error);
    }
  }

  function sortbydate(a: any, b: any) {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return dateB.getTime() - dateA.getTime();
  }

  return (
    <main className="relative">
      <Navbar />
      <div className="min-h-screen bg-gradient-to-t from-palette1 via-palette3 via-90% to-palette5">
        <div className="mt-17 text-center pb-5">
          <h1 className="font-bold text-balance text-4xl">
            Feeling for: {vtuber && vtuber.name}
          </h1>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ">
          {userFeelings.length !== 0 &&
            userFeelings
              .sort(sortbydate)
              .map((feeling) => (
                <EnvelopeCard
                  key={feeling.id}
                  feeling={feeling}
                  Role={currentUser?.role ?? "USER"}
                  currentUserName={currentUser ? currentUser.name : ""}
                  onDelete={() => deleteFeeling(feeling.id)}
                />
              ))}
        </div>

        <div className="fixed bottom-0 grid w-full gap-2 p-10">
          <Input
            className="placeholder-white text-white"
            placeholder="Type your feeling here."
            value={currentFeeling}
            onChange={(e) => handleChangeFeeling(e.target.value)}
            disabled={loading} // Disable input during loading
          />
          <Button
            variant="outline"
            onClick={postFeeling}
            disabled={loading} // Disable button during loading
            onKeyDown={(e) => {
              if (e.key === "Enter") postFeeling();
            }}
          >
            {loading ? "Posting..." : "Send message"} {/* Show loading text */}
          </Button>
        </div>
      </div>
    </main>
  );
}
