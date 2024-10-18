"use client";
import Navbar from "../../components/Navbar";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { tree } from "next/dist/build/templates/app-page";
import { fork } from "child_process";
import { Loader2, Pen, Route } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface membership {
  vtuber: string | null;
  tier: "1" | "2" | "3" | "4";
  tier_name: string;
}

export default function ProfilePage() {
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [name, setName] = useState("iShowSpeed");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [approvePicture, setapprovePicture] = useState<File | null>(null);
  const [currentUserMemberships, setCurrentUserMemberships] = useState([]);
  const { toast } = useToast();
  const [IsFetching, setIsFetching] = useState(true);

  const router = useRouter();

  const handleProfilePictureChange = (image: File) => {
    if (image) {
      setProfilePicture(image);

      // Update the currentUser state to show the selected image as a preview
      setCurrentUser((prevUser) => ({
        ...prevUser,
        profile_picture: URL.createObjectURL(image),
      }));
    }
  };
  const handleApprovePictureChange = (image: File) => {
    if (image) {
      setapprovePicture(image);
    }
  };

  const handleUploadProfilePicture = async () => {
    setIsLoading1(true);
    const formData = new FormData();
    if (!profilePicture) {
      toast({
        description: "please choose file",
      });
      setIsLoading1(false);
      return;
    }
    formData.append("profile_image", profilePicture);

    const response = await fetch(
      "http://localhost:4000/api/users/upload/profile_image",
      { method: "POST", credentials: "include", body: formData }
    );

    const parsedResponse = await response.json();
    if (parsedResponse.msg.ok) {
      // Update the currentUser with the new profile picture
      setCurrentUser((prevUser) => ({
        ...prevUser,
        profile_picture: parsedResponse.data.profile_picture_url, // assuming this is the new image URL
      }));
      toast({
        description: parsedResponse.msg,
      });
      setIsLoading1(false);
    } else {
      toast({
        description: parsedResponse.msg,
      });
      setIsLoading1(false);
    }
    toast({
      description: "successfully upload new profile image",
      className: "bg-green-500",
    });
    setIsLoading1(false);
  };

  const handleUploadApprove = async () => {
    setIsLoading2(true);
    const formData = new FormData();
    if (!approvePicture) {
      toast({
        description: "please choose file",
      });
      setIsLoading2(false);
      return;
    }
    formData.append("mebmership_image", approvePicture);

    const response = await fetch(
      "http://localhost:4000/api/users/upload/membership",
      { method: "POST", credentials: "include", body: formData }
    );

    const parsedResponse = await response.json();
    if (parsedResponse.msg.ok) {
      // Update the currentUser with the new profile picture
      setCurrentUser((prevUser) => ({
        ...prevUser,
        profile_picture: parsedResponse.data.profile_picture_url, // assuming this is the new image URL
      }));
    } else {
      toast({
        description: parsedResponse.msg,
        className: "bg-green-500",
      });
    }
    setIsLoading2(false);
  };

  useEffect(() => {
    setIsFetching(true);
    const getUser = async () => {
      const response = await fetch("http://localhost:4000/api/users/info", {
        credentials: "include",
      });

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
    };

    const getUserMemberships = async () => {
      const response = await fetch(
        "http://localhost:4000/api/users/get/memberships",
        { credentials: "include" }
      );

      if (!response.ok) {
        setIsLoggedIn(false);
        setCurrentUserMemberships([]);
        return;
      }

      const parsedResponse = await response.json();
      setCurrentUserMemberships(parsedResponse.data);
    };

    async function fetchData() {
      await getUser();
      await getUserMemberships();
      setIsFetching(false);
    }
    fetchData();
  }, []);

  return (
    <>
      <Navbar />
      {isLoggedIn ? (
        <>
          <div className="min-h-screen  bg-gradient-to-t from-palette1 via-palette3 via-90% to-palette5">
            <div className="flex justify-start items-center ml-10 gap-5">
              <div className="relative">
                <Avatar className="w-40 h-40">
                  <AvatarImage
                    src={`${
                      (currentUser as any).profile_picture
                        ? (currentUser as any).profile_picture
                        : "img/1.jpg"
                    }`}
                  ></AvatarImage>
                </Avatar>
                <div className="absolute top-0 left-0">
                  {!(currentUser as any).isOauth ? (
                    <Sheet>
                      <SheetTrigger asChild>
                        <Pen className="hover:cursor-pointer hover:text-black"></Pen>
                      </SheetTrigger>
                      <SheetContent className="bg-white sm:max-w-[600px] max-h-[90vh] p-0 bg-gradient-to-br from-background to-secondary/10 border-2 border-primary/20 rounded-xl shadow-xl overflow-hidden">
                        <SheetHeader>
                          <SheetTitle className="text-2xl font-bold text-primary p-5">
                            Edit your profile Picture
                          </SheetTitle>
                        </SheetHeader>
                        <div className="grid gap-4 py-4">
                          <div>
                            <Input
                              type="file"
                              accept="image/jpeg, image/png"
                              onChange={(e) => {
                                if (e.target.files) {
                                  handleProfilePictureChange(e.target.files[0]);
                                }
                              }}
                              required={true}
                              className="text-sm text-muted-foreground file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                            />
                          </div>
                        </div>
                        <SheetFooter>
                          <SheetClose asChild>
                            <Button
                              disabled={isLoading1}
                              onClick={handleUploadProfilePicture}
                              type="submit"
                            >
                              {isLoading1 ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Please wait
                                </>
                              ) : (
                                "Save Change"
                              )}
                            </Button>
                          </SheetClose>
                        </SheetFooter>
                      </SheetContent>
                    </Sheet>
                  ) : (
                    <div></div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-white text-bold text-4xl">
                  {(currentUser as any).name}
                </div>
                <div className="text-white font-light">
                  Favorite vtuber : {(currentUser as any).favorite_vtuber}
                </div>
                <div className="text-gray-400">
                  Role : {(currentUser as any).role}
                </div>
                <div className="flex gap-9">
                  <input
                    type="file"
                    accept="image/jpeg, image/png"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleApprovePictureChange(e.target.files[0]);
                      }
                    }}
                    required={true}
                    className="text-sm text-muted-foreground file:mr-4 file:py-1 file:px-4 file:rounded-full  file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />

                  <Button
                    disabled={isLoading2}
                    onClick={handleUploadApprove}
                    type="submit"
                  >
                    {isLoading2 ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Please wait
                      </>
                    ) : (
                      "Send Approve"
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <p className="text-white p-5 font-bold">Current membership</p>
            <div className="text-white grid px-8  gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ">
              {currentUserMemberships &&
                currentUserMemberships.length !== 0 &&
                currentUserMemberships.map((membership: membership) => (
                  <div className="border-4 border-white rounded-2xl p-4">
                    <p>Vtuber: {membership.vtuber}</p>
                    <p>Tier: {membership.tier}</p>
                    <p>Tier Name: {membership.tier_name}</p>
                  </div>
                ))}
            </div>
          </div>
        </>
      ) : !IsFetching ? (
        <div className="h-screen bg-gradient-to-t from-palette1 via-palette3 via-90% to-palette5 flex items-center justify-center">
          <div className="text-4xl">You have to login first.</div>
        </div>
      ) : (
        <div className="h-screen bg-gradient-to-t from-palette1 via-palette3 via-90% to-palette5 flex items-center justify-center">
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-16 h-16 border-4 border-white border-t-transparent border-solid rounded-full animate-spin"></div>
          </div>
        </div>
      )}
    </>
  );
}
