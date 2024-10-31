"use client";
import Navbar from "../components/Navbar";
import VtubeList from "./VtubeList";
import AddVtube from "./AddVtube";
import { useEffect, useRef, useState } from "react";
import "dotenv/config";

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

interface Vtuber {
  name: string;
  id: string;
  description: string | null;
  height: string;
  birthdate: string;
  age: string;
  icon_image: string;
  port_image: string;
  youtube_channel_id: string;
  youtube: string;
  twitter: string;
  discord: string;
  facebook: string;
}
interface memberships {
  id: string;
  vtuber_name: string;
  tier: number;
  tier_name: string;
}

export default function Portfolio() {
  const [vtubers, setVtubers] = useState<Vtuber[] | any[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [memberships, setmemberships] = useState<memberships[] | null>(null);

  const [currentUserMemberships, setCurrentUserMemberships] = useState([]);
  const isLoading = useRef(true);

  function handleVtubersEdit(id: string, vtuberinfo: any) {
    const vtuber: Vtuber = vtubers.find((vtuber: Vtuber) => vtuber.id === id);
    vtuber.name = vtuberinfo.name;
    vtuber.age = vtuberinfo.age;
    vtuber.description = vtuberinfo.description;
    vtuber.birthdate = vtuberinfo.birthdate;
    vtuber.height = vtuberinfo.height;
    vtuber.youtube = vtuberinfo.youtube;
    vtuber.discord = vtuberinfo.youtube;
    vtuber.twitter = vtuberinfo.youtube;
    vtuber.facebook = vtuberinfo.youtube;
    console.log(vtuber);
  }

  function handleVtuberIconEdit(id: string, iconImage: string) {
    const vtuber: Vtuber = vtubers.find((vtuber: Vtuber) => vtuber.id === id);
    vtuber.icon_image = iconImage;
  }

  function handleVtuberPortEdit(id: string, portImage: string) {
    const vtuber: Vtuber = vtubers.find((vtuber: Vtuber) => vtuber.id === id);
    vtuber.port_image = portImage;
  }

  // Fetch vtuber data on component mount
  useEffect(() => {
    isLoading.current = true;
    const fetchVtubers = async () => {
      try {
        const vtubersData = await fetch(
          `http://${process.env.WEB_HOST}:4000/api/vtubers/get`
        ); // Adjust the API route as needed
        const result = await vtubersData.json();
        setVtubers(result.data);
      } catch (error) {
        console.error("Error fetching vtubers data:", error);
      }
    };

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

    const fetchMembership = async () => {
      try {
        const res = await fetch(
          `http://${process.env.WEB_HOST}:4000/api/admins/get/memberships`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        setmemberships(data.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const getUserMemberships = async () => {
      const response = await fetch(
        `http://${process.env.WEB_HOST}:4000/api/users/get/memberships`,
        { credentials: "include" }
      );

      if (!response.ok) {
        setCurrentUserMemberships([]);
        return;
      }

      const parsedResponse = await response.json();
      setCurrentUserMemberships(parsedResponse.data);
    };

    getUserMemberships();
    fetchMembership();
    fetchVtubers();
    fetchUser();
    isLoading.current = false;
  }, []);

  // useEffect(() => {
  //   console.log(currentUserMemberships);
  // }, [currentUserMemberships]);

  return (
    <div className="relative ">
      <Navbar />

      <main className="min-h-screen bg-gradient-to-t from-palette1 via-palette3 via-50% to-palette5">
        <div className="flex justify-center items-center ">
          <p className="font-bold text-white text-3xl">
            PIXELA WORLD END MEMBERS
          </p>
          <div className="flex justify-center  ml-5">
            {currentUser && currentUser.role === "ADMIN" && <AddVtube />}
          </div>
        </div>

        {!isLoading.current ? (
          <div className="ml-7 mr-7 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 ">
            {vtubers && vtubers.length !== 0 ? (
              <VtubeList
                vtubers={vtubers}
                currentUser={currentUser}
                membershiptier={memberships}
                currentUserMembership={currentUserMemberships}
                fav_vtube={currentUser?.favorite_vtuber as string | null}
                handleVtuberEdit={handleVtubersEdit}
                handleVtuberIconEdit={handleVtuberIconEdit}
                handleVtuberPortEdit={handleVtuberPortEdit}
              />
            ) : (
              <p>No vtubers available.</p>
            )}
          </div>
        ) : (
          <p className="text-center text-3xl"> Page is loading... </p>
        )}
      </main>
    </div>
  );
}
