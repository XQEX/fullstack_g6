import React from "react";
import { notFound } from "next/navigation";
// import Navbar from "@/app/components/Navbar";
import Image from "next/image";
import Link from "next/link";
// import { count } from "console";

export const dynamicParams = true;

//static rendering
export async function generateStaticParam() {
  const res = await fetch("http://10.10.182.248:4567/Vtubers");
  const vtubes = await res.json();
  return vtubes.map((ticket: any) => ({
    id: ticket.id,
  }));
}

//-------------------------

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

async function getVtube(name: string): Promise<Vtuber> {
  const res = await fetch("http://10.10.182.248:4000/api/vtubers/get/" + name, {
    next: {
      revalidate: 60,
    },
    credentials: "include",
  });

  if (!res.ok) {
    notFound();
  }

  const parsedResponse = await res.json();

  return (parsedResponse as any).data;
}

export default async function page({ params }: { params: { name: string } }) {
  const vtuber = await getVtube(params.name); // Parse id to number

  return (
    <main className="h-full shaper">
      <div className=" flex-grow  flex justify-end items-center gap-5 mr-5 pt-3 top-0 z-50 sticky">
        <Link href="/" className="text-palette1 hover:underline">
          Homepage
        </Link>
        <Link href="/portfolio" className="text-palette1 hover:underline">
          Portfolio
        </Link>
        <Link href="/live" className="text-palette1 hover:underline">
          Live
        </Link>
      </div>

      <div className="mt-17 text-center mt-5">
        <h1 className="font-bold text-balance text-4xl">{vtuber.name}</h1>
      </div>

      <div
        className={`grid mt-5 sm:grid-cols-1 md:grid-cols-1 gap-x-4 lg:grid-cols-1
        }`}
      >
        <div className="flex justify-center items-center col-span-1">
          <Image
            src={vtuber.port_image}
            alt={vtuber.name}
            width={400}
            height={500}
            quality={100}
            className="rounded-3xl"
          />
        </div>
        <div className="mx-6 text-white bg-gray-700 bg-opacity-40 pl-4 rounded-3xl p-4 lg:col-span-2">
          <p>{vtuber.description}</p>
          <div className="grid grid-cols-2 mt-5">
            <p>อายุ: {vtuber.age}</p>
            <p>ส่วนสูง: {vtuber.height}</p>
            <p>วันเกิด: {vtuber.birthdate}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 mt-5">
        <div className="flex justify-center items-center Vhover hover:cursor-pointer">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[40px] h-[30px]"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              {" "}
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M9.49614 7.13176C9.18664 6.9549 8.80639 6.95617 8.49807 7.13509C8.18976 7.31401 8 7.64353 8 8V16C8 16.3565 8.18976 16.686 8.49807 16.8649C8.80639 17.0438 9.18664 17.0451 9.49614 16.8682L16.4961 12.8682C16.8077 12.6902 17 12.3589 17 12C17 11.6411 16.8077 11.3098 16.4961 11.1318L9.49614 7.13176ZM13.9844 12L10 14.2768V9.72318L13.9844 12Z"
                fill="white"
              ></path>{" "}
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M0 12C0 8.25027 0 6.3754 0.954915 5.06107C1.26331 4.6366 1.6366 4.26331 2.06107 3.95491C3.3754 3 5.25027 3 9 3H15C18.7497 3 20.6246 3 21.9389 3.95491C22.3634 4.26331 22.7367 4.6366 23.0451 5.06107C24 6.3754 24 8.25027 24 12C24 15.7497 24 17.6246 23.0451 18.9389C22.7367 19.3634 22.3634 19.7367 21.9389 20.0451C20.6246 21 18.7497 21 15 21H9C5.25027 21 3.3754 21 2.06107 20.0451C1.6366 19.7367 1.26331 19.3634 0.954915 18.9389C0 17.6246 0 15.7497 0 12ZM9 5H15C16.9194 5 18.1983 5.00275 19.1673 5.10773C20.0989 5.20866 20.504 5.38448 20.7634 5.57295C21.018 5.75799 21.242 5.98196 21.4271 6.23664C21.6155 6.49605 21.7913 6.90113 21.8923 7.83269C21.9973 8.80167 22 10.0806 22 12C22 13.9194 21.9973 15.1983 21.8923 16.1673C21.7913 17.0989 21.6155 17.504 21.4271 17.7634C21.242 18.018 21.018 18.242 20.7634 18.4271C20.504 18.6155 20.0989 18.7913 19.1673 18.8923C18.1983 18.9973 16.9194 19 15 19H9C7.08058 19 5.80167 18.9973 4.83269 18.8923C3.90113 18.7913 3.49605 18.6155 3.23664 18.4271C2.98196 18.242 2.75799 18.018 2.57295 17.7634C2.38448 17.504 2.20866 17.0989 2.10773 16.1673C2.00275 15.1983 2 13.9194 2 12C2 10.0806 2.00275 8.80167 2.10773 7.83269C2.20866 6.90113 2.38448 6.49605 2.57295 6.23664C2.75799 5.98196 2.98196 5.75799 3.23664 5.57295C3.49605 5.38448 3.90113 5.20866 4.83269 5.10773C5.80167 5.00275 7.08058 5 9 5Z"
                fill="white"
              ></path>{" "}
            </g>
          </svg>
          <Link href={`${vtuber.youtube}`} className="pl-3">
            Youtube
          </Link>
        </div>

        <div className="flex justify-center items-center Vhover hover:cursor-pointer">
          <svg
            className="w-[40px] h-[30px]"
            xmlns="http://www.w3.org/2000/svg"
            shape-rendering="geometricPrecision"
            text-rendering="geometricPrecision"
            image-rendering="optimizeQuality"
            fill-rule="white"
            clip-rule="evenodd"
            viewBox="0 0 512 462.799"
          >
            <path
              fill-rule="nonzero"
              d="M403.229 0h78.506L310.219 196.04 512 462.799H354.002L230.261 301.007 88.669 462.799h-78.56l183.455-209.683L0 0h161.999l111.856 147.88L403.229 0zm-27.556 415.805h43.505L138.363 44.527h-46.68l283.99 371.278z"
            />
          </svg>
          <Link href={`${vtuber.twitter}`}>Twitter</Link>
        </div>

        <div className="flex justify-center  items-center Vhover hover:cursor-pointer">
          <svg
            className="w-[40px] h-[30px]"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              {" "}
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M11 12.5C11 13.8807 10.1046 15 9 15C7.89543 15 7 13.8807 7 12.5C7 11.1193 7.89543 10 9 10C10.1046 10 11 11.1193 11 12.5ZM8.22293 12.5C8.22293 13.0365 8.57084 13.4713 9 13.4713C9.42916 13.4713 9.77707 13.0365 9.77707 12.5C9.77707 11.9635 9.42916 11.5287 9 11.5287C8.57084 11.5287 8.22293 11.9635 8.22293 12.5Z"
                fill="#ffffff"
              ></path>{" "}
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M15 15C16.1046 15 17 13.8807 17 12.5C17 11.1193 16.1046 10 15 10C13.8954 10 13 11.1193 13 12.5C13 13.8807 13.8954 15 15 15ZM15 13.4713C14.5708 13.4713 14.2229 13.0365 14.2229 12.5C14.2229 11.9635 14.5708 11.5287 15 11.5287C15.4292 11.5287 15.7771 11.9635 15.7771 12.5C15.7771 13.0365 15.4292 13.4713 15 13.4713Z"
                fill="#ffffff"
              ></path>{" "}
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M9.9864 3.33561C9.94083 3.06219 9.78382 2.81995 9.55284 2.66671C9.32186 2.51347 9.03764 2.46298 8.76801 2.52729C6.61476 3.04085 5.39826 3.471 3.47772 4.64723C3.33168 4.73668 3.21105 4.86214 3.1274 5.01158C1.9368 7.13867 1.14514 8.97344 0.657859 10.9416C0.171558 12.9058 1.51992e-05 14.9565 0 17.5C0 17.7652 0.105353 18.0196 0.292888 18.2071C1.35191 19.2661 2.45067 20.1002 3.71884 20.6638C4.99135 21.2294 6.3833 21.5 8 21.5C8.43043 21.5 8.81257 21.2246 8.94868 20.8162L9.62339 18.7921C10.3731 18.918 11.1769 19 12 19C12.8231 19 13.6269 18.918 14.3766 18.7921L15.0513 20.8162C15.1874 21.2246 15.5696 21.5 16 21.5C17.6167 21.5 19.0086 21.2294 20.2812 20.6638C21.5493 20.1002 22.6481 19.2661 23.7071 18.2071C23.8946 18.0196 24 17.7652 24 17.5C24 14.9565 23.8284 12.9058 23.3421 10.9416C22.8549 8.97344 22.0632 7.13867 20.8726 5.01158C20.789 4.86214 20.6683 4.73668 20.5223 4.64723C18.6017 3.471 17.3852 3.04085 15.232 2.52729C14.9624 2.46298 14.6781 2.51347 14.4472 2.66671C14.2162 2.81995 14.0592 3.06219 14.0136 3.33561L13.6356 5.60381C13.129 5.53843 12.5832 5.49994 12 5.49994C11.4168 5.49994 10.8709 5.53843 10.3644 5.60381L9.9864 3.33561ZM16.7135 19.4783L16.3365 18.3471C17.2221 18.0953 18.1008 17.7971 18.9331 17.4013C19.4309 17.1622 19.6405 16.5647 19.4014 16.0669C19.1622 15.5692 18.5647 15.3597 18.0669 15.5986C17.4725 15.8793 16.8456 16.1 16.2191 16.2953C15.0702 16.6535 13.5516 17 12 17C10.4484 17 8.92975 16.6535 7.78088 16.2953C7.15483 16.1001 6.53092 15.8781 5.93607 15.6C5.44219 15.3668 4.83698 15.5709 4.59864 16.0669C4.36123 16.561 4.57887 17.1681 5.0722 17.4039C5.90316 17.7978 6.77969 18.0958 7.66354 18.3471L7.28647 19.4783C6.22623 19.4118 5.33457 19.1933 4.53112 18.8362C3.65215 18.4455 2.83779 17.8709 2.00169 17.0797C2.02016 14.8272 2.19155 13.069 2.59925 11.4223C3.01458 9.74468 3.68586 8.13987 4.7452 6.2178C6.0043 5.46452 6.90106 5.0901 8.19227 4.73633L8.40706 6.02507C7.53196 6.29408 6.64115 6.64982 5.903 7.1977C5.46929 7.52129 5.37507 8.1667 5.7 8.59994C6.03024 9.04026 6.6539 9.1307 7.09547 8.80332C7.4639 8.53958 7.89071 8.34569 8.30889 8.17842C9.14624 7.84348 10.3952 7.49994 12 7.49994C13.6048 7.49994 14.8538 7.84348 15.6911 8.17842C16.1093 8.34568 16.5361 8.53955 16.9045 8.8033C17.3461 9.1307 17.9698 9.04027 18.3 8.59994C18.6241 8.16782 18.526 7.51604 18.0932 7.19491C17.3475 6.65617 16.4693 6.29447 15.5929 6.02507L15.8077 4.73633C17.0989 5.0901 17.9957 5.46452 19.2548 6.2178C20.3141 8.13987 20.9854 9.74468 21.4008 11.4223C21.8085 13.069 21.9798 14.8272 21.9983 17.0797C21.1622 17.8709 20.3479 18.4455 19.4689 18.8362C18.6654 19.1933 17.7738 19.4118 16.7135 19.4783ZM9 15C10.1046 15 11 13.8807 11 12.5C11 11.1193 10.1046 10 9 10C7.89543 10 7 11.1193 7 12.5C7 13.8807 7.89543 15 9 15ZM17 12.5C17 13.8807 16.1046 15 15 15C13.8954 15 13 13.8807 13 12.5C13 11.1193 13.8954 10 15 10C16.1046 10 17 11.1193 17 12.5ZM9 13.4713C8.57084 13.4713 8.22293 13.0365 8.22293 12.5C8.22293 11.9635 8.57084 11.5287 9 11.5287C9.42916 11.5287 9.77707 11.9635 9.77707 12.5C9.77707 13.0365 9.42916 13.4713 9 13.4713ZM15 13.4713C14.5708 13.4713 14.2229 13.0365 14.2229 12.5C14.2229 11.9635 14.5708 11.5287 15 11.5287C15.4292 11.5287 15.7771 11.9635 15.7771 12.5C15.7771 13.0365 15.4292 13.4713 15 13.4713Z"
                fill="#ffffff"
              ></path>{" "}
            </g>
          </svg>
          <Link href={`${vtuber.discord}`} className="pl-3">
            Discord
          </Link>
        </div>

        <div className="flex justify-center items-center Vhover hover:cursor-pointer">
          <svg
            className="w-[40px] h-[30px]"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              {" "}
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M20 1C21.6569 1 23 2.34315 23 4V20C23 21.6569 21.6569 23 20 23H4C2.34315 23 1 21.6569 1 20V4C1 2.34315 2.34315 1 4 1H20ZM20 3C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H15V13.9999H17.0762C17.5066 13.9999 17.8887 13.7245 18.0249 13.3161L18.4679 11.9871C18.6298 11.5014 18.2683 10.9999 17.7564 10.9999H15V8.99992C15 8.49992 15.5 7.99992 16 7.99992H18C18.5523 7.99992 19 7.5522 19 6.99992V6.31393C19 5.99091 18.7937 5.7013 18.4813 5.61887C17.1705 5.27295 16 5.27295 16 5.27295C13.5 5.27295 12 6.99992 12 8.49992V10.9999H10C9.44772 10.9999 9 11.4476 9 11.9999V12.9999C9 13.5522 9.44771 13.9999 10 13.9999H12V21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3H20Z"
                fill="#ffffff"
              ></path>{" "}
            </g>
          </svg>
          <Link href={`${vtuber.facebook}`} className="pl-3">
            FaceBook
          </Link>
        </div>
      </div>
    </main>
  );
}
