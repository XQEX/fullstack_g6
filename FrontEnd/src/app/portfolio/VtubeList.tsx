import Link from "next/link";
import Image from "next/image";
import EditEachVtube from "./EditEachVtube";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

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
interface memberships {
  id: string;
  vtuber_name: string;
  tier: number;
  tier_name: string;
}

interface usermemberships {
  vtuber: string;
  tier: number;
  tier_name: string;
}

interface VtubeListProps {
  vtubers: Vtuber[] | any[];
  currentUser: {
    role: "ADMIN" | "USER" | "GUEST";
  } | null;
  fav_vtube: string | null;
  currentUserMembership: usermemberships[];
  membershiptier: memberships[] | null;
  handleVtuberEdit: (id: string, vtuberinfo: any) => void;
  handleVtuberIconEdit: (id: string, iconImage: string) => void;
  handleVtuberPortEdit: (id: string, portImage: string) => void;
}

export default function VtubeList({
  vtubers,
  currentUser,
  fav_vtube,
  membershiptier,
  currentUserMembership,
  handleVtuberEdit,
  handleVtuberIconEdit,
  handleVtuberPortEdit,
}: VtubeListProps) {
  const [currentFavorite, setCurrentFavorite] = useState<string | null>(null);
  const [animateHearts, setAnimateHearts] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    if (fav_vtube) {
      setCurrentFavorite(fav_vtube);
    }
  }, [fav_vtube]);

  function sortbyFavoriteAndAlphabet(a: Vtuber, b: Vtuber) {
    if (a.name === currentFavorite) return -1;
    if (b.name === currentFavorite) return 1;

    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  }

  async function handlefavoritebtn(vtube: Vtuber) {
    try {
      const res = await fetch("http://g6-backend:4000/api/users/fav_vtuber", {
        credentials: "include",
        method: "POST",
        body: JSON.stringify({ vtuber_name: vtube.name }),
        headers: { "content-type": "application/json" },
      });
      const parsedResponse = await res.json();

      if (!parsedResponse.ok) {
        return;
      }

      setCurrentFavorite(vtube.name);
      setAnimateHearts((prev) => ({ ...prev, [vtube.name]: true }));
      setTimeout(() => {
        setAnimateHearts((prev) => ({ ...prev, [vtube.name]: false }));
      }, 2000);
    } catch (error) {
      console.error("Error updating favorite:", error);
    }
  }

  return (
    <>
      {vtubers.sort(sortbyFavoriteAndAlphabet).map((vtube) => {
        // Filter membership tiers that match the current vtuber name
        const matchingTiers = membershiptier
          ? membershiptier
              .filter((tier) => tier.vtuber_name === vtube.name)
              .map((tier) => tier.tier_name) // Extract tier_name from matched tiers
          : [];

        // Filter currentUserMembership to find the matching Vtuber
        const userMembership = currentUserMembership.find(
          (membership) => membership.vtuber === vtube.name // Check for direct match
        );

        return (
          <div
            key={vtube.id}
            className={`mt-6 mr-6 overflow-hidden shadow-md relative transition ease-in-out delay-80 hover:-translate-y-1 
              hover:scale-105 duration-300 text-white rounded-3xl ${
                currentFavorite === vtube.name ? "bg-inherit" : "bg-inherit"
              }`}
            style={{ position: "relative" }}
          >
            {currentFavorite === vtube.name && (
              <div className="absolute inset-0 z-0 animate-heart-loop">
                {[...Array(10)].map((_, index) => (
                  <Heart
                    key={index}
                    className={`absolute text-pink-500 opacity-20`}
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      fontSize: `${Math.random() * 80 + 20}px`,
                      animation: `floating-hearts ${
                        Math.random() * 5 + 5
                      }s infinite ease-in-out`,
                    }}
                  />
                ))}
              </div>
            )}

            <div className="flex justify-start text-left relative z-10">
              <Link href={`/portfolio/${vtube.name}`} passHref>
                <div className="flex">
                  {vtube.icon_image !== "UNDEFINED" && (
                    <Image
                      className="rounded-3xl"
                      alt={vtube.name}
                      src={vtube.icon_image}
                      width={150}
                      height={100}
                      quality={100}
                      priority
                      style={{ objectFit: "cover" }} // Optional, adjust as needed
                    />
                  )}

                  <div className="ml-4 mt-4">
                    <p className="font-bold text-3xl">{vtube.name}</p>
                    <p>ส่วนสูง: {vtube.height}</p>
                    <p>วันเกิด: {vtube.birthdate}</p>
                    <p>อายุ: {vtube.age}</p>
                    {userMembership ? (
                      <div>
                        Tier: {userMembership.tier} {userMembership.tier_name}
                      </div>
                    ) : (
                      <p></p>
                    )}
                  </div>
                </div>
              </Link>

              {/* Display currentUserMembership if matching */}

              <button
                onClick={() => handlefavoritebtn(vtube)}
                className="hover:underline hover:cursor-pointer absolute bottom-0 right-4 m-2 z-10"
              >
                <Heart
                  className={
                    currentFavorite === vtube.name
                      ? "fill-pink-500 text-pink-500 w-6 h-6"
                      : "text-gray-500 w-6 h-6"
                  }
                />
              </button>

              {animateHearts[vtube.name] && (
                <div className="absolute bottom-2 right-6 animate-heart-rise z-10">
                  {[...Array(5)].map((_, index) => (
                    <div
                      key={index}
                      className={`heart-animation-${index}`}
                      style={{ animationDelay: `${index * 0.2}s` }}
                    >
                      <Heart className="text-pink-500  fill-pink-500 w-6 h-6" />
                    </div>
                  ))}
                </div>
              )}

              {currentUser?.role === "ADMIN" && (
                <EditEachVtube
                  id={vtube.id}
                  name={vtube.name}
                  age={vtube.age}
                  icon_image={vtube.icon_image}
                  description={vtube.description}
                  height={vtube.height}
                  birthdate={vtube.birthdate}
                  youtube={vtube.youtube}
                  twitter={vtube.twitter}
                  discord={vtube.discord}
                  facebook={vtube.facebook}
                  port_image={vtube.port_image}
                  handleVtuberEdit={handleVtuberEdit}
                  handleVtuberIconEdit={handleVtuberIconEdit}
                  handleVtuberPortEdit={handleVtuberPortEdit}
                  tierNames={matchingTiers} // Pass the array of tier names
                />
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
