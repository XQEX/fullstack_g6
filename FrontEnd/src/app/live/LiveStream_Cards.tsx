"use client";
import { Badge, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

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
interface LivesCard_prop {
  vtube: Vtuber[];
  key: string;
  title: string;
  link: string;
  thumbnail: string;
  category: string | null;
  status: "LIVE" | "END";
  insertType: "AUTO" | "MANUAL";
  byVtuber: string;
  vtuberIcon: string;
}

function LiveStream_Cards(prop: LivesCard_prop) {
  const matchedVtuber = prop.vtube.find((v) => v.id === prop.byVtuber);

  return (
    <Link
      href={prop.link}
      className="block w-full max-w-[360px] transition-transform duration-300 ease-in-out transform hover:scale-105"
    >
      <div
        className={`flex flex-col border-2 ${
          prop.status === "LIVE"
            ? "border-transparent backdrop-blur-sm bg-red-500/30 "
            : "border-transparent"
        } rounded-xl`}
      >
        <div className="relative">
          <Image
            src={prop.thumbnail}
            alt="Stream thumbnail"
            width={360}
            height={202}
            className="w-full rounded-xl object-cover"
          />
          {prop.status === "LIVE" && (
            <div className="absolute bottom-2 left-2 flex items-center bg-red-600 text-white text-xs font-medium px-1.5 py-0.5 rounded">
              <Clock className="w-3 h-3 mr-1" />
              <span>LIVE</span>
            </div>
          )}
        </div>
        <div className="flex mt-3 space-x-3">
          <Image
            src={prop.vtuberIcon}
            alt="VTuber icon"
            width={36}
            height={36}
            className={`rounded-full w-9 h-9 ${
              prop.status === "LIVE" ? "border-2 border-red-500" : ""
            }`}
          />

          <div className="flex-1">
            <h3 className="text-sm font-semibold line-clamp-2 text-gray-900">
              {prop.title}
            </h3>
            <p className="text-xs text-gray-700 mt-1">{matchedVtuber?.name}</p>

            {prop.status === "END" && (
              <div className="flex items-center text-xs text-gray-500 mt-0.5">
                <span className="mx-1">•</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default LiveStream_Cards;
