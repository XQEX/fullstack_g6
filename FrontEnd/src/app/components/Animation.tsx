import React, { useEffect, useState } from "react";
import Image from "next/image";

export default function Animation() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row justify-center items-center space-y-4 lg:space-y-0 text-center">
      <Image
        className={`select-none transition-opacity duration-1000 ${
          isVisible ? "opacity-100 scale-105" : "opacity-0"
        }`}
        src="/img/pixela_logo.png"
        alt="logo"
        width={150}
        height={50}
        quality={100}
      ></Image>
      <h1
        className={`ml-3 text-white pl-4 select-none text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl transition-opacity duration-1000 ${
          isVisible ? "opacity-100 scale-105" : "opacity-0"
        }`}
        style={{
          textShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
        }}
      >
        Welcome to Pixela WorldEnd FC
      </h1>
    </div>
  );
}
