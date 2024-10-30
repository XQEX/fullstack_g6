import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Description } from "@radix-ui/react-toast";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

interface UserCardProps {
  id: string;
  name: string;
  profile_picture: string | null;
  imgsrc: string; // Ensure this is of type string
}

interface Membership {
  id: string;
  vtuber_name: string;
  tier: "1" | "2" | "3" | "4";
  tier_name: string;
}

function UserCard({ id, name, profile_picture, imgsrc }: UserCardProps) {
  const [currentMembershipID, setCurrentMembershipID] =
    useState<Membership | null>(null);
  const [userMemberships, setUserMemberships] = useState([]);
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state

  const getMemberShipTier = async () => {
    const response = await fetch(
      `http://g6-backend:4000/api/admins/get/memberships`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
    const parsedResponse = await response.json();
    if (!parsedResponse.ok) {
      return;
    }

    setUserMemberships(parsedResponse.data);
  };

  function handleMembershipChange(membershipID: any) {
    setCurrentMembershipID(membershipID);
  }

  async function handleApprove() {
    setIsLoading1(true);
    if (!currentMembershipID) {
      setIsLoading1(false);
      toast({
        description: "Please select category",
      });
      return;
    }
    let response;
    try {
      response = await fetch(
        `http://g6-backend:4000/api/admins/membership/approve/${id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ membership_tier_id: currentMembershipID }),
        }
      );
    } catch (error) {
      console.log(error);
      setIsLoading1(false);
      return;
    }

    toast({
      description: "Approved",
    });
    setIsLoading1(false);
  }

  async function handleDeny() {
    setIsLoading2(true);
    let response;
    try {
      response = await fetch(
        `http://g6-backend:4000/api/admins/membership/deny/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
    } catch (error) {
      console.log(error);
      setIsLoading2(false);
      return;
    }

    if (!response.ok) {
      console.log("Something went wrong");
      setIsLoading2(false);
    }
    toast({
      description: "Denied",
    });
    setIsLoading2(false);
  }

  useEffect(() => {
    getMemberShipTier();
  }, []);

  return (
    <div className="mt-6 ml-10 mr-10 bg-inherit overflow-hidden shadow-md relative text-white rounded-3xl">
      <div className="flex justify-start text-left static">
        <div className="flex">
          <div className="mt-4">
            <p className="font-bold text-2xl">From user: {name}</p>

            {/* Image is clickable to open modal */}
            <div>
              <Image
                alt="img"
                src={imgsrc}
                height={300}
                width={300}
                quality={100}
                className="cursor-pointer"
                onClick={() => setIsModalOpen(true)}
              />
            </div>
          </div>
          <div className="ml-4 mt-9">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select
              name="membership"
              onValueChange={(value) => handleMembershipChange(value)}
            >
              <SelectTrigger className="col-span-3 border-gray-300">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {userMemberships &&
                    userMemberships.length !== 0 &&
                    userMemberships.map((membership: Membership) => (
                      <SelectItem key={membership.id} value={membership.id}>
                        <span>
                          Vtuber: {membership.vtuber_name}, Tier:{" "}
                          {membership.tier}, Name: {membership.tier_name}
                        </span>
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center">
            <Button
              disabled={isLoading1}
              onClick={handleApprove}
              type="submit"
              className="bg-[#41B3A2] hover:bg-[#76b5ac] ml-5 w-80 h-40"
            >
              {isLoading1 ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Approve"
              )}
            </Button>
          </div>
          <div className="flex items-center">
            <Button
              disabled={isLoading2}
              onClick={handleDeny}
              type="submit"
              variant="destructive"
              className="hover:bg-[#c66767]  ml-5 w-80 h-40"
            >
              {isLoading2 ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Deny"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Modal for full-resolution image */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-75 z-50">
          <div className="relative">
            <Image
              alt="full-resolution-img"
              src={imgsrc}
              height={600} // Full resolution size
              width={600}
              quality={100}
            />
            <button
              className="absolute top-2 right-2 text-black text-2xl"
              onClick={() => setIsModalOpen(false)}
            >
              X
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserCard;
