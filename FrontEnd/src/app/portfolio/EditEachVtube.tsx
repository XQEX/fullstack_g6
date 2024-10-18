"use client";
import React, { useState, ChangeEvent } from "react";
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
import { Loader2, Pen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EditVtubeProps {
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
  tierNames: string[];
  handleVtuberEdit: (id: string, vtuberinfo: any) => void;
  handleVtuberIconEdit: (id: string, iconImage: string) => void;
  handleVtuberPortEdit: (id: string, portImage: string) => void;
}

export default function EditEachVtube({
  id,
  name,
  age,
  icon_image,
  description,
  height,
  birthdate,
  youtube,
  twitter,
  discord,
  facebook,
  port_image,
  tierNames,
  handleVtuberEdit,
  handleVtuberIconEdit,
  handleVtuberPortEdit,
}: EditVtubeProps) {
  const { toast } = useToast();
  const [isLoading1, setIsLoading1] = useState(false); // State for loading
  const [isLoading2, setIsLoading2] = useState(false); // State for loading
  const [isLoading3, setIsLoading3] = useState(false); // State for loading
  const [isDeleting, setIsDeleting] = useState(false); // state for loading during delete
  const [IconPicture, setIconPicture] = useState<File | null>(null);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [vtubeinfo, setVtubeinfo] = useState({
    name,
    age,
    description,
    height,
    birthdate,
    youtube,
    twitter,
    discord,
    facebook,
    tier1: tierNames[0],
    tier2: tierNames[1],
    tier3: tierNames[2],
    tier4: tierNames[3],
  });

  const [isOpen, setIsOpen] = useState(false);

  const handleDeleteVtuber = async (id: string) => {
    try {
      setIsDeleting(true);
      const response = await fetch(
        `http://localhost:4000/api/vtubers/delete/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          description: `Error: ${errorData.message}`,
        });

        setIsDeleting(false);
        return;
      }

      toast({
        description: "Vtuber profile deleted successfully",
        className: "bg-red-500",
      });
      setIsDeleting(false);
    } catch (error) {
      console.error("Failed to delete Vtuber:", error);
      toast({
        description: "An error occurred while deleting the Vtuber.",
      });

      setIsDeleting(false);
    }
  };
  const handleUploadIconPicture = async (id: string) => {
    const formData = new FormData();
    setIsLoading1(true);
    if (!IconPicture) {
      toast({
        description: "No Image Add",
      });

      setIsLoading1(false);
      return;
    }
    formData.append("vtuber_icon_image", IconPicture);
    const response = await fetch(
      "http://localhost:4000/api/vtubers/edit/icon-image/" + id,
      { method: "PUT", credentials: "include", body: formData }
    );

    const parsedResponse = await response.json();
    toast({
      description: parsedResponse.msg,
      className: "bg-green-500",
    });

    handleVtuberIconEdit(id, parsedResponse.data);
    setIsLoading1(false);
  };

  const handleUploadProfilePicture = async (id: string) => {
    setIsLoading2(true);
    const formData = new FormData();
    if (!profilePicture) {
      setIsLoading2(false);
      toast({
        description: "No Image Add",
      });

      return;
    }
    formData.append("vtuber_port_image", profilePicture);
    const response = await fetch(
      "http://localhost:4000/api/vtubers/edit/port-image/" + id,
      { method: "PUT", credentials: "include", body: formData }
    );

    const parsedResponse = await response.json();
    toast({
      description: parsedResponse.msg,
      className: "bg-green-500",
    });

    handleVtuberPortEdit(id, parsedResponse.data);
    setIsLoading2(false);
  };

  const handleProfilePicutreChange = (image: any) => {
    if (image) {
      setProfilePicture(image);
    }
  };
  const handleIconPicutreChange = (image: any) => {
    if (image) {
      setIconPicture(image);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVtubeinfo((prev) => ({ ...prev, [name]: value }));
  };

  async function handleEdit(param: string) {
    setIsLoading3(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const res = await fetch("http://localhost:4000/api/vtubers/edit/" + param, {
      next: {
        revalidate: 0,
      },
      credentials: "include",
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vtubeinfo),
    });

    if (!res.ok) {
      setIsLoading3(false);
      return;
    }

    setIsLoading3(false);
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="absolute top-0 right-4"
      >
        Edit
        <Pen className="size-4"></Pen>
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-white sm:max-w-[600px] max-h-[90vh] p-0 bg-gradient-to-br from-background to-secondary/10 border-2 border-primary/20 rounded-xl shadow-xl overflow-hidden">
          <ScrollArea className="h-full max-h-[90vh] p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary">
                Edit Profile
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Make changes to your profile here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-4 mt-4">
              {[
                { label: "Name", value: vtubeinfo.name, name: "name" },
                { label: "Age", value: vtubeinfo.age, name: "age" },
                {
                  label: "Description",
                  value: vtubeinfo.description,
                  name: "description",
                },
                { label: "Height", value: vtubeinfo.height, name: "height" },
                {
                  label: "Birthdate",
                  value: vtubeinfo.birthdate,
                  name: "birthdate",
                },
                {
                  label: "YouTube URI",
                  value: vtubeinfo.youtube,
                  name: "youtube",
                },
                {
                  label: "Twitter URI",
                  value: vtubeinfo.twitter,
                  name: "twitter",
                },
                {
                  label: "Discord URI",
                  value: vtubeinfo.discord,
                  name: "discord",
                },
                {
                  label: "Facebook URI",
                  value: vtubeinfo.facebook,
                  name: "facebook",
                },
                {
                  label: "Tier1",
                  value: vtubeinfo.tier1,
                  name: "tier1",
                },
                {
                  label: "Tier2",
                  value: vtubeinfo.tier2,
                  name: "tier2",
                },
                {
                  label: "Tier3",
                  value: vtubeinfo.tier3,
                  name: "tier3",
                },
                {
                  label: "Tier4",
                  value: vtubeinfo.tier4,
                  name: "tier4",
                },
              ].map((field, index) => (
                <div key={index} className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    {field.label}
                  </Label>
                  <Input
                    value={field.value}
                    name={field.name}
                    onChange={handleChange}
                    className=" text-black bg-background/50 border border-input hover:border-primary focus:border-primary transition-colors"
                  />
                </div>
              ))}
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Icon Image
                </Label>
                <Input
                  type="file"
                  accept="image/jpeg, image/png"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleIconPicutreChange(e.target.files[0]);
                    }
                  }}
                  className="text-sm text-muted-foreground file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Profile Image
                </Label>
                <Input
                  type="file"
                  accept="image/jpeg, image/png"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleProfilePicutreChange(e.target.files[0]);
                    }
                  }}
                  className="text-sm text-muted-foreground file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </div>
            </div>

            <DialogFooter className="p-6 pt-2 border-t">
              <div className="flex flex-wrap gap-2 justify-end">
                <Button
                  disabled={isDeleting}
                  variant="destructive"
                  onClick={() => handleDeleteVtuber(id)}
                  className="w-full sm:w-auto"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : (
                    "Delete"
                  )}
                </Button>
                <Button
                  disabled={isLoading1}
                  onClick={() => handleUploadIconPicture(id)}
                  className="w-full sm:w-auto bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  {isLoading1 ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : (
                    "Upload Icon"
                  )}
                </Button>
                <Button
                  disabled={isLoading2}
                  onClick={() => handleUploadProfilePicture(id)}
                  className="w-full sm:w-auto bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  {isLoading2 ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : (
                    "Upload Profile"
                  )}
                </Button>
                <Button
                  disabled={isLoading3}
                  onClick={() => {
                    handleEdit(id);
                    handleVtuberEdit(id, vtubeinfo);
                  }}
                  className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isLoading3 ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
