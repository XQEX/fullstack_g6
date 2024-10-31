"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "dotenv/config";

interface myObject {
  [key: string]: any;
}

export default function LoginForm() {
  const [isLoggedin, setIsLoggedIn] = useState(false);
  const { toast } = useToast(); // Import useToast hook
  //auth variable
  const [currentUser, setCurrentUser] = useState({});

  useEffect(() => {
    const getUser = async () => {
      const response = await fetch(
        `http://${process.env.WEB_HOST}:4000/api/users/info`,
        {
          credentials: "include",
        }
      );

      // not authenticated
      if (!response.ok) {
        setIsLoggedIn(false);
        setCurrentUser({});
        return;
      }

      // authenticated
      const parsedResponse = await response.json();
      setIsLoggedIn(true);
      setCurrentUser(parsedResponse.data);

      // return to home page
      router.push("/");
    };

    getUser();
  }, []);

  //--------------

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  // function getAllCookies() {
  //   if (!document.cookie) {
  //     return null;
  //   }
  //   const cookies = document.cookie.split(";");
  //   const cookieObject: myObject = {};
  //   cookies.forEach((cookie) => {
  //     const [name, value] = cookie.split("=");
  //     cookieObject[name] = value;
  //   });
  //   return cookieObject;
  // }

  // function getSessionID() {
  //   const cookieCheck = getAllCookies();
  //   if (!cookieCheck) {
  //     return null;
  //   }

  //   const prefix = "s%3A";
  //   const postfix = ".";

  //   const preFormatSessID = cookieCheck.connSessID as String;

  //   const startInd = preFormatSessID.indexOf(prefix) + prefix.length;
  //   const endInd = preFormatSessID.indexOf(postfix);
  //   const formatedSessID = preFormatSessID.substring(startInd, endInd);
  //   return formatedSessID;
  // }

  async function LoginUser(e: any) {
    try {
      e.preventDefault();
      // console.log(username);
      // console.log(password);
      const user = { name_email: username, password: password };
      const response = await fetch(
        `http://${process.env.WEB_HOST}:4000/api/users/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(user),
        }
      );
      const res = await response.json();

      if (!res.ok) {
        toast({
          description: res.msg,
        });
        return;
      }
      toast({
        description: res.msg,
        className: "bg-green-500",
      });
      router.push("/");
    } catch (error) {
      throw error;
    }
  }

  function handleGoogleOauth() {
    window.open(
      `http://${process.env.WEB_HOST}:4000/api/users/oauth/google`,
      "_self"
    );
  }

  function handleTwitterOauth() {
    window.open(
      `http://${process.env.WEB_HOST}:4000/api/users/oauth/twitter`,
      "_self"
    );
  }

  function handleDiscordOauth() {
    window.open(
      `http://${process.env.WEB_HOST}:4000/api/users/oauth/discord`,
      "_self"
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
      {!isLoggedin ? (
        <div className="bg-white p-10 rounded-lg shadow-md w-[350px] ">
          <Link
            className="justify-center items-center flex mb-4 ml-10 mr-10"
            href="/"
          >
            <Image
              src="/img/pixela_logo.png"
              alt="logo"
              width={50}
              height={50}
            />
          </Link>
          <h2 className="text-2xl font-bold mb-6 text-center text-black">
            Login
          </h2>
          <form className="space-y-4">
            <div className="space-y-2">
              <Input
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                placeholder="Username or Email"
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Input
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md"
              type="submit"
              onClick={LoginUser}
              onKeyDown={(e) => {
                if (e.key === "Enter") LoginUser;
              }}
            >
              Login
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-500">
            <span className="px-2">Or continue with</span>
          </div>
          <div className="mt-4 flex justify-center space-x-4">
            <Button onClick={handleGoogleOauth}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-google"
                viewBox="0 0 16 16"
              >
                <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z" />
              </svg>
            </Button>
            <Button onClick={handleTwitterOauth}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-twitter-x"
                viewBox="0 0 16 16"
              >
                <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
              </svg>
            </Button>
            <Button onClick={handleDiscordOauth}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-discord"
                viewBox="0 0 16 16"
              >
                <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612" />
              </svg>
            </Button>
          </div>
        </div>
      ) : (
        // Loading screen
        <div>
          <h1>Redirecting...</h1>
        </div>
      )}
    </div>
  );
}
