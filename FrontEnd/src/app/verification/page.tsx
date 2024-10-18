"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"


export default function VerficationPage() {
  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
      <Card>
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>Are you the email owner?</CardDescription>
        </CardHeader>
        <CardContent>
        <InputOTP maxLength={6} className="flex justify-center">
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
        </CardContent>
        <CardFooter className="justify-center flex m-4">
          <Button>Proceed</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
