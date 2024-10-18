"use client";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface User {
  isOauth: boolean;
  id: string;
  name: string;
  email: string;
  profile_picture: string;
  favorite_vtuber: string | null;
  role: "ADMIN" | "USER" | "GUEST"; // Define all possible roles
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadpart, setloadpart] = useState(false); // false initially
  const [currentUser, setCurrentUser] = useState<User>({
    isOauth: false,
    id: "",
    name: "",
    email: "",
    profile_picture: "",
    favorite_vtuber: "",
    role: "GUEST",
    createdAt: "",
    updatedAt: "",
  });
  const { toast } = useToast();

  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/users/info", {
          credentials: "include",
        });

        if (!response.ok) {
          // User not authenticated
          setIsLoggedIn(false);
          setCurrentUser({} as User); // Set empty user object
        } else {
          // User authenticated
          const parsedResponse = await response.json();
          setIsLoggedIn(true);
          setCurrentUser(parsedResponse.data);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        setIsLoggedIn(false);
        setCurrentUser({} as User);
      } finally {
        // Set loadpart to true after checking authentication status
        setloadpart(true);
      }
    };

    getUser();

    // Check session every minute (60000 ms)
    const intervalId = setInterval(getUser, 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  async function handleLogout() {
    const res = await fetch("http://localhost:4000/api/users/logout", {
      credentials: "include",
      method: "POST",
    });
    if (res.ok) {
      setIsLoggedIn(false);
      router.push("/"); // redirect to homepage or login page
    }
    toast({
      description: "Successfully Logout",
      className: "bg-black",
    });
  }

  return (
    <nav className="flex top-0 z-50 sticky bg-palette5">
      <div className="flex-grow flex justify-end items-center gap-x-5 m-4">
        <Link href="/" className="text-palette1 hover:underline">
          Homepage
        </Link>
        <Link href="/portfolio" className="text-palette1 hover:underline">
          Portfolio
        </Link>

        {loadpart ? (
          isLoggedIn ? (
            <>
              <Link href="/live" className="text-palette1 hover:underline">
                Live
              </Link>
              <Link href="/feeling" className="text-palette1 hover:underline">
                Feeling
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="cursor-pointer">
                    <Avatar className="select-none">
                      <AvatarImage
                        src={`${
                          currentUser?.profile_picture
                            ? currentUser.profile_picture
                            : "img/1.jpg"
                        }`}
                      />
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>{currentUser?.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {currentUser?.role === "ADMIN" && (
                    <div>
                      <Link href="/userStatus">
                        <DropdownMenuItem className="hover:cursor-pointer hover:underline">
                          User Status
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/pendingMembership">
                        <DropdownMenuItem className="hover:cursor-pointer hover:underline">
                          Pending Membership
                        </DropdownMenuItem>
                      </Link>
                    </div>
                  )}

                  <Link href="/profile">
                    <DropdownMenuItem className="hover:cursor-pointer hover:underline">
                      Profile
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/settings">
                    <DropdownMenuItem className="hover:cursor-pointer hover:underline">
                      Settings
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/">
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="hover:cursor-pointer hover:underline"
                    >
                      Logout
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login" className="text-white hover:underline">
                Login
              </Link>
              <Link href="/signup" className="text-white hover:underline">
                Sign Up
              </Link>
            </>
          )
        ) : (
          <p>Loading...</p> // Show loading state while checking authentication
        )}
      </div>
    </nav>
  );
}

export default Navbar;
