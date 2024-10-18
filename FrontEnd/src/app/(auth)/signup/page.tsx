"use client";

import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Value } from "@radix-ui/react-select";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Description } from "@radix-ui/react-toast";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

export function CheckboxWithText({
  isChecked,
  setIsChecked,
}: {
  isChecked: boolean;
  setIsChecked: (checked: boolean) => void;
}) {
  return (
    <div className="items-top flex space-x-2">
      <Checkbox
        id="terms1"
        checked={isChecked}
        onCheckedChange={setIsChecked}
      />
      <div className="grid gap-1.5 leading-none">
        <label className=" text-black text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Accept{" "}
          <span>
            <Link href="/terms" className="text-blue-500">
              terms and conditions
            </Link>
          </span>
        </label>
      </div>
    </div>
  );
}

export default function SignUpForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [Confirmpassword, setConfirmpassword] = useState("");
  const [email, setEmail] = useState("");
  const { toast } = useToast(); // Import useToast hook
  const [isChecked, setIsChecked] = useState(false);

  const router = useRouter();

  async function RegisterUser(e: any) {
    e.preventDefault();

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check if the email is in the correct format
    if (!emailRegex.test(email)) {
      toast({
        description: "Please enter a valid email address!",
      });
      return;
    }

    if (password !== Confirmpassword) {
      toast({
        description: "Passwords not match!",
      });
      return;
    }

    try {
      console.log(username);
      console.log(password);
      console.log(email);
      const user = { username: username, email: email, password: password };
      const response = await fetch("http://localhost:4000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      const { msg, data } = await response.json();
      console.log(data);

      toast({
        description: msg,
      });

      if (data) {
        router.push("/login");
      }
    } catch (error) {
      throw error;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
      <div className="bg-white p-10 rounded-lg shadow-lg w-[350px]">
        <Link
          className="justify-center items-center flex mb-4 ml-10 mr-10"
          href="/"
        >
          <Image src="/img/pixela_logo.png" alt="logo" width={50} height={50} />
        </Link>
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          Create an account
        </h2>
        <form className="space-y-4">
          <div className="space-y-2">
            <Input
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
              placeholder="Confirm Password"
              type="password"
              value={Confirmpassword}
              onChange={(e) => setConfirmpassword(e.target.value)}
            />
          </div>
          <CheckboxWithText isChecked={isChecked} setIsChecked={setIsChecked} />
          <Button
            onClick={RegisterUser}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md"
            type="submit"
            disabled={!isChecked}
          >
            Sign up
          </Button>
        </form>
      </div>
    </div>
  );
}
//xd
