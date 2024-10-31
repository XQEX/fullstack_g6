"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import "dotenv/config";

interface Vtuber {
  Name: string;
  Age: string;
  Description: string;
  Height: string;
  Birthdate: string;
  Youtube: string;
  Twitter: string;
  Discord: string;
  Facebook: string;
  tier1: string;
  tier2: string;
  tier3: string;
  tier4: string;
  profilePicture: File | null;
  IconPicture: File | null;
}

export default function AddVtube() {
  const [vtuber, setVtuber] = useState<Vtuber>({
    Name: "",
    Age: "",
    Description: "",
    Height: "",
    Birthdate: "",
    Youtube: "",
    Twitter: "",
    Discord: "",
    Facebook: "",
    tier1: "",
    tier2: "",
    tier3: "",
    tier4: "",
    profilePicture: null,
    IconPicture: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setVtuber((prevVtuber) => ({
      ...prevVtuber,
      [name]: value,
    }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "profilePicture" | "IconPicture"
  ) => {
    const file = e.target.files?.[0] || null;
    setVtuber((prevVtuber) => ({
      ...prevVtuber,
      [field]: file,
    }));
  };

  const handleAddVtuber = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData1 = new FormData();
    const formData2 = new FormData();

    // Append files if they exist
    if (vtuber.profilePicture) {
      formData1.append("vtuber_icon_image", vtuber.profilePicture);
    } else {
      toast({
        description: "please input profile picture",
        className: "bg-black",
      });

      setIsLoading(false);
      return;
    }
    if (vtuber.IconPicture) {
      formData2.append("vtuber_port_image", vtuber.IconPicture);
    } else {
      toast({
        description: "please input Icon picture",
        className: "bg-black",
      });
      setIsLoading(false);
      return;
    }

    const VTUDE = {
      name: vtuber.Name,
      description: vtuber.Description,
      age: vtuber.Age,
      height: vtuber.Height,
      birthdate: vtuber.Birthdate,
      youtube: vtuber.Youtube,
      twitter: vtuber.Twitter,
      discord: vtuber.Discord,
      facebook: vtuber.Facebook,
      tier1: vtuber.tier1,
      tier2: vtuber.tier2,
      tier3: vtuber.tier3,
      tier4: vtuber.tier4,
    };
    try {
      const response1 = await fetch(
        `http://${process.env.WEB_HOST}:4000/api/vtubers/add/info`,
        {
          method: "POST",
          credentials: "include",
          body: JSON.stringify(VTUDE),
          headers: { "content-type": "application/json" },
        }
      );
      const p1 = await response1.json();

      if (!p1.ok) {
        toast({
          description: p1.msg,
          className: "bg-black",
        });
        return;
      }

      const response2 = await fetch(
        `http://${process.env.WEB_HOST}:4000/api/vtubers/add/icon-image/` +
          p1.data[0].id,
        {
          method: "POST",
          credentials: "include",
          body: formData1,
        }
      );
      const p2 = await response2.json();
      if (!p2.ok) {
        toast({
          description: p2.msg,
          className: "bg-black",
        });
        return;
      }

      const response3 = await fetch(
        `http://${process.env.WEB_HOST}:4000/api/vtubers/add/port-image/` +
          p1.data[0].id,
        {
          method: "POST",
          credentials: "include",
          body: formData2,
        }
      );

      if (!response3.ok) {
        toast({
          description: "An error occurred",
          className: "bg-black",
        });
        return;
      }
    } catch (error: any) {
      toast({
        description: "An error occurred: " + error.message,
      });
    } finally {
      setIsLoading(false);
    }
    toast({
      description: "Successfully add Vtuber",
      className: "bg-green-500",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add Vtuber</Button>
      </DialogTrigger>
      <DialogContent className="bg-white sm:max-w-[600px] max-h-[90vh] p-0 bg-gradient-to-br from-background to-secondary/10 border-2 border-primary/20 rounded-xl shadow-xl overflow-hidden">
        <ScrollArea className="h-full max-h-[90vh] p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">
              Add Vtuber
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Add new Vtuber here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleAddVtuber}
            className="grid grid-cols-1 gap-4 mt-4"
          >
            <div>
              {Object.keys(vtuber).map((key) =>
                key !== "profilePicture" && key !== "IconPicture" ? (
                  <div key={key} className="space-y-1">
                    <Label
                      htmlFor={key.toLowerCase()}
                      className="text-sm font-medium text-muted-foreground"
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Label>
                    <Input
                      id={key.toLowerCase()}
                      name={key} // Ensure name attribute matches the state key
                      value={vtuber[key as keyof Vtuber] as string} // Bind value to state
                      onChange={handleChange}
                      className=" text-black bg-background/50 border border-input hover:border-primary focus:border-primary transition-colors"
                    />
                  </div>
                ) : null
              )}
              <div className="mt-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Profile Image
                </Label>
                <Input
                  type="file"
                  accept="image/jpeg, image/png"
                  onChange={(e) => handleFileChange(e, "profilePicture")}
                  className="text-sm text-muted-foreground file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </div>
              <div className="mt-4">
                <Label className="text-sm font-medium text-muted-foreground">
                  Icon Image
                </Label>
                <Input
                  type="file"
                  accept="image/jpeg, image/png"
                  onChange={(e) => handleFileChange(e, "IconPicture")}
                  className="text-sm text-muted-foreground file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  "Add Vtuber"
                )}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
