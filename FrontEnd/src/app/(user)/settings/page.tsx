"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Undo } from "lucide-react";
import { toast } from "sonner";
import Navbar from "../../components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
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

export default function SettingsPage() {
  const { toast } = useToast();
  //Account part
  const [newEmail, setNewEmail] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [curPassword1, setcurPassword1] = useState("");
  const [curPassword2, setcurPassword2] = useState("");
  const [isLoading1, setisLoading1] = useState(false);
  const [isLoading2, setisLoading2] = useState(false);
  //-----------------------

  //security part
  const [newPassword, setnewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [curPassword3, setcurPassword3] = useState("");
  const [isLoading3, setisLoading3] = useState(false);
  const [isLoading4, setisLoading4] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [IsFetching, setIsFetching] = useState(true);

  useEffect(() => {
    setIsFetching(true);
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
      setIsFetching(false);
    };

    fetchUser();
  }, []);

  const ChangeUsername = async () => {
    setisLoading1(true);
    console.log(newUsername);
    console.log(curPassword1);
    const response = await fetch(
      `http://${process.env.WEB_HOST}:4000/api/users/edit/username`,
      {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername, password: curPassword1 }),
      }
    );
    const parsed = await response.json();
    if (!response.ok) {
      toast({
        description: parsed.msg,
        className: "bg-black",
      });
      setisLoading1(false);
      return;
    }
    toast({
      description: "successfully change username",
      className: "bg-black",
    });
    setNewUsername("");
    setisLoading1(false);
  };

  const ChangeEmail = async () => {
    setisLoading2(true);
    const response = await fetch(
      `http://${process.env.WEB_HOST}:4000/api/users/edit/email`,
      {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, password: curPassword2 }),
      }
    );
    const parsed = await response.json();
    if (!response.ok) {
      toast({
        description: parsed.msg,
        className: "bg-black",
      });

      setisLoading2(false);
      return;
    }

    toast({
      description: "successfully change email",
      className: "bg-black",
    });
    setNewEmail("");
    setisLoading2(false);
  };

  const ChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      toast({
        description: "Passwords not match!",
        className: "bg-black",
      });

      return;
    }

    setisLoading3(true);
    const response = await fetch(
      `http://${process.env.WEB_HOST}:4000/api/users/edit/password`,
      {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: newPassword,
          old_password: curPassword3,
        }),
      }
    );
    const parsed = await response.json();
    if (!response.ok) {
      toast({
        description: parsed.msg,
        className: "bg-black",
      });

      setisLoading3(false);
      return;
    }

    toast({
      description: "successfully change password",
      className: "bg-black",
    });
    setcurPassword1("");
    setcurPassword2("");
    setcurPassword3("");
    setnewPassword("");
    setConfirmNewPassword("");
    setisLoading3(false);
  };

  const deleteAccount = async () => {
    setisLoading4(true);
    const response = await fetch(
      `http://${process.env.WEB_HOST}:4000/api/users/delete`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );
    if (!response.ok) {
      toast({
        description: "something went wrong",
      });

      setisLoading4(false);
      return;
    }

    toast({
      description: "successfully deleted account",
    });
    setisLoading4(false);
  };

  return (
    <div className="mx-auto pb-10 bg-white h-screen">
      <Navbar />
      {currentUser ? (
        <>
          <h1 className="text-2xl font-bold m-4 text-black">Settings</h1>
          <Tabs defaultValue="account" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Info</CardTitle>
                  <CardDescription>
                    Make changes to your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>New Username</Label>
                    <Input
                      id="username"
                      placeholder="Enter your new username"
                      onChange={(e) => {
                        setNewUsername(e.target.value);
                      }}
                      value={newUsername}
                    ></Input>
                  </div>
                  {newUsername && (
                    <>
                      <div className="space-y-2">
                        <Label>Current Password</Label>
                        <Input
                          id="curPassword"
                          type="password"
                          placeholder="Enter your current password"
                          onChange={(e) => setcurPassword1(e.target.value)}
                          value={curPassword1}
                        />
                      </div>
                      <CardFooter>
                        <Button
                          disabled={isLoading1}
                          className="bg-blue-500 hover:bg-blue-800"
                          onClick={ChangeUsername}
                        >
                          {isLoading1 ? <>Loading...</> : <>Change Username</>}
                        </Button>
                      </CardFooter>
                    </>
                  )}
                  <div className="space-y-2">
                    <Label>New Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your new email"
                      onChange={(e) => {
                        setNewEmail(e.target.value);
                      }}
                      value={newEmail}
                    ></Input>
                  </div>
                  {newEmail && (
                    <>
                      <div className="space-y-2">
                        <Label>Current Password</Label>
                        <Input
                          id="curPassword"
                          type="password"
                          placeholder="Enter your current password"
                          onChange={(e) => setcurPassword2(e.target.value)}
                          value={curPassword2}
                        />
                      </div>
                      <CardFooter>
                        <Button
                          disabled={isLoading2}
                          className="bg-blue-500 hover:bg-blue-800"
                          onClick={ChangeEmail}
                        >
                          {isLoading2 ? <>Loading...</> : <>Change Email</>}
                        </Button>
                      </CardFooter>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Change your appearance here</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Label>Theme</Label>
                    <div className="flex items-center space-x-2">
                      Light
                      <Switch></Switch>
                      Dark
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="bg-blue-500 hover:bg-blue-800">
                    Save
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Protect your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Your Current Password</Label>
                    <Input
                      className="border-gray-300"
                      type="password"
                      placeholder="Enter your current password here"
                      onChange={(e) => setcurPassword3(e.target.value)}
                      value={curPassword3}
                    ></Input>
                  </div>
                  <div className="space-y-2">
                    <Label>Your New Password</Label>
                    <Input
                      className="border-gray-300"
                      type="password"
                      placeholder="Enter your new password"
                      onChange={(e) => {
                        setnewPassword(e.target.value);
                      }}
                      value={newPassword}
                    ></Input>
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm Your New Password</Label>
                    <Input
                      className="border-gray-300"
                      type="password"
                      placeholder="Confirm your new password here"
                      onChange={(e) => {
                        setConfirmNewPassword(e.target.value);
                      }}
                      value={confirmNewPassword}
                    ></Input>
                  </div>
                </CardContent>
                <CardFooter className="flex">
                  <div className="space-y-2">
                    <Button
                      className="bg-blue-500"
                      disabled={isLoading3}
                      onClick={ChangePassword}
                    >
                      {" "}
                      {isLoading3 ? <>Loading...</> : <>Save</>}
                    </Button>
                    <Button className="bg-red-500 flex" onClick={deleteAccount}>
                      Delete Your Account
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
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
    </div>
  );
}

//xd
