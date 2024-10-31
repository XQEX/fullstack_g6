"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import LiveStream_Cards from "./LiveStream_Cards";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Filter,
  FilterIcon,
  FilterXIcon,
  Loader2,
  Plus,
  Search,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "../components/Navbar";
import { useToast } from "@/hooks/use-toast";
import "dotenv/config";

interface LiveStreams {
  clip_name: string;
  views: number;
  clip_path: string;
  category: string;
}

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

interface Lives {
  id: string;
  title: string;
  link: string;
  thumbnail: string;
  category: string | null;
  status: "LIVE" | "END";
  insertType: "AUTO" | "MANUAL";
  byVtuber: string;
  vtuberIcon: string;
}

interface Vtuber {
  name: string;
  id: string;
  description: string | null;
  height: string;
  birthdate: string;
  age: string;
  icon_image: string;
  port_image: string;
  youtube_channel_id: string;
  youtube: string;
  twitter: string;
  discord: string;
  facebook: string;
}

interface categories {
  name: string;
}

export default function LivePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [liveStreams, setliveStreams] = useState<Lives[] | null>(null);
  const [category, setCategory] = useState<string>("none");
  const [categories, setcategories] = useState<categories[]>([]);
  const [title, setTitle] = useState<string>("");
  const [link, setLink] = useState<string>("");
  const [byVtuber, setByVtuber] = useState<string>("");
  const [isLoading, setisLoading] = useState(false);
  const [kohisfetching, setkohisfetching] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [vtubers, setVtubers] = useState<Vtuber[] | any[]>([]);
  const [selectedVtubers, setSelectedVtubers] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSearch = (event: any) => {
    setSearchTerm(event.target.value);
  };

  const handleAddLiveStream = async () => {
    setisLoading(true);
    const liveStreams = {
      vtuber_id: byVtuber,
      name: title,
      link: link,
      stream_category_name: category,
      status: "END",
    };
    const res = await fetch(
      `http://${process.env.WEB_HOST}:4000/api/live-streams/add`,
      {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(liveStreams),
        headers: { "content-type": "application/json" },
      }
    );

    const parsedres = await res.json();

    if (!parsedres.ok) {
      toast({
        description: parsedres.msg,
      });

      setisLoading(false);
      return;
    }

    setByVtuber("");
    setCategory("none");
    setLink("");
    setTitle("");
    toast({
      description: parsedres.msg,
      className: "bg-green-500",
    });

    setisLoading(false);
  };

  async function handleDelete(id: string) {
    const res = await fetch(
      `http://${process.env.WEB_HOST}:4000/api/live-streams/delete/` + id,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    const parsed = await res.json();

    if (!parsed.ok) {
      toast({
        description: parsed.msg,
        className: "bg-red-500",
      });
      return;
    }
    toast({
      description: parsed.msg,
      className: "bg-green-500",
    });
    if (liveStreams && liveStreams.length !== 0) {
      setliveStreams(liveStreams.filter((stream) => stream.id !== id));
    }
  }

  useEffect(() => {
    setkohisfetching(true);
    async function fetchdata() {
      await fetchLiveCategory();
      await fetchVtubers();
      await fetchUser();
      await fetchlive();
      setkohisfetching(false);
    }

    const fetchlive = async () => {
      try {
        const live = await fetch(
          `http://${process.env.WEB_HOST}:4000/api/live-streams/get`,
          {
            credentials: "include",
          }
        );

        const result = await live.json();
        setliveStreams(result.data);
      } catch (error) {
        console.error("Error fetching liveStream data:", error);
      }
    };

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
    };

    const fetchVtubers = async () => {
      try {
        const vtubersData = await fetch(
          `http://${process.env.WEB_HOST}:4000/api/vtubers/get`,
          {
            credentials: "include",
          }
        );
        const result = await vtubersData.json();
        setVtubers(result.data);
      } catch (error) {
        console.error("Error fetching vtubers data:", error);
      }
    };

    const fetchLiveCategory = async () => {
      try {
        const vtubersData = await fetch(
          `http://${process.env.WEB_HOST}:4000/api/live-streams/get/categories`,
          {
            credentials: "include",
          }
        );
        const result = await vtubersData.json();
        console.log(result.data);
        setcategories(result.data);
      } catch (error) {
        console.error("Error fetching live cat", error);
      }
    };

    // fetchLiveCategory();
    // fetchVtubers();
    // fetchUser();
    // fetchlive();
    fetchdata();
  }, []);

  const handleVtuberSelection = (vtuberId: string) => {
    setSelectedVtubers((prev) =>
      prev.includes(vtuberId)
        ? prev.filter((id) => id !== vtuberId)
        : [...prev, vtuberId]
    );
  };

  const handleCategorySelection = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((name) => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  const applyFilters = async () => {
    console.log(selectedVtubers);
    console.log(selectedCategories);
    const filter = { vtubers: selectedVtubers, categories: selectedCategories };
    const filterParams = new URLSearchParams(
      `filter=${JSON.stringify(filter)}`
    );
    const response = await fetch(
      `http://${process.env.WEB_HOST}:4000/api/live-streams/get?${filterParams}`,
      {
        credentials: "include",
      }
    );
    if (!response.ok) {
      console.log("Something went wrong at filter");
    }

    const parsedResponse = await response.json();
    console.log(parsedResponse.data);
    setliveStreams(parsedResponse.data);
  };

  function sortbyStatus(a: Lives, b: Lives) {
    if (a.status === "LIVE" && b.status === "END") return -1;
    if (a.status === "END" && b.status === "LIVE") return 1;
    return 0; // Keep the current order if status is the same
  }

  const filteredLiveStreams = liveStreams
    ? liveStreams.filter((stream) =>
        stream.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-t from-palette1 via-palette3 to-palette5">
      <Navbar />
      {currentUser ? (
        <>
          <p className="flex justify-center font-bold text-white text-3xl">
            Livestreams
          </p>
          <div className="flex justify-center">
            <div className="relative w-1/2 mt-2">
              <Input
                placeholder="Search here..."
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                className="placeholder:text-white bg-white text-black rounded-full shadow-md pl-10 pr-4 py-2"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="flex justify-center items-center m-3">
            {currentUser?.role === "ADMIN" && (
              <div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Manual Add</Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white sm:max-w-[425px] text-black">
                    <DialogHeader>
                      <DialogTitle>Manual Add</DialogTitle>
                      <DialogDescription>
                        Add a new live stream or video manually
                      </DialogDescription>
                    </DialogHeader>
                    <form>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="title" className="text-right">
                            Title
                          </Label>
                          <Input
                            id="title"
                            name="title"
                            value={title}
                            onChange={(e) => {
                              setTitle(e.target.value);
                            }}
                            className="col-span-3 border-gray-300"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="link" className="text-right">
                            Link
                          </Label>
                          <Input
                            id="link"
                            name="link"
                            value={link}
                            onChange={(e) => {
                              setLink(e.target.value);
                            }}
                            className="col-span-3 border-gray-300"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="category" className="text-right">
                            Category
                          </Label>
                          <Select
                            name="category"
                            onValueChange={(value) => {
                              setCategory(value);
                            }}
                            value={category}
                          >
                            <SelectTrigger className="col-span-3 border-gray-300">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {categories.map((cat) => (
                                  <SelectItem
                                    key={cat.name}
                                    value={cat.name}
                                    className="flex items-center m-1"
                                  >
                                    <span>{cat.name}</span>
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="byVtuber" className="text-right">
                            By Vtuber
                          </Label>

                          <Select
                            value={byVtuber}
                            onValueChange={(value) => setByVtuber(value)}
                            name="vtuber"
                          >
                            <SelectTrigger className="col-span-3 border-gray-300">
                              <SelectValue
                                defaultValue="none"
                                placeholder="Select Vtuber"
                                className=""
                              />
                            </SelectTrigger>
                            <SelectGroup>
                              <SelectContent>
                                <SelectItem
                                  value="none"
                                  className="flex items-center m-1"
                                >
                                  Not selected
                                </SelectItem>
                                {vtubers.map((vtuber) => (
                                  <SelectItem
                                    key={vtuber.id}
                                    value={vtuber.id}
                                    className="flex items-center m-1"
                                  >
                                    <div className="flex items-center">
                                      <img
                                        src={vtuber.icon_image}
                                        alt={vtuber.name}
                                        className="h-8 w-8 rounded-full mr-2"
                                      />
                                      <span>{vtuber.name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </SelectGroup>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          disabled={isLoading}
                          type="submit"
                          onClick={handleAddLiveStream}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddLiveStream;
                          }}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            "Add Live Stream"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="ml-4">
                  Filter
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-white text-black p-6 rounded-lg shadow-md max-h-[80vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold">
                    Filter Options
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-600">
                    You can select at least one VTuber and one category
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <Label className="text-right font-medium">VTubers</Label>
                  <ScrollArea className="h-[200px] w-full border rounded-md p-4">
                    <div className="grid grid-cols-3 gap-4">
                      {vtubers.map((vtuber) => (
                        <div
                          key={vtuber.id}
                          className={`flex flex-col items-center cursor-pointer ${
                            selectedVtubers.includes(vtuber.id)
                              ? "border-2 border-blue-500"
                              : ""
                          }`}
                          onClick={() => handleVtuberSelection(vtuber.id)}
                        >
                          <img
                            src={vtuber.icon_image}
                            alt={vtuber.name}
                            className="h-16 w-16 rounded-full flex justify-center"
                          />
                          <p className="text-center text-xs mt-1">
                            {vtuber.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <Label className="text-right font-medium">Categories</Label>
                  <ScrollArea className="h-[200px] w-full border rounded-md p-4">
                    <div className="grid grid-cols-2 gap-4">
                      {categories &&
                        categories.map((cat) => (
                          <div
                            key={cat.name}
                            className={`cursor-pointer p-2 rounded ${
                              selectedCategories.includes(cat.name)
                                ? "bg-blue-100"
                                : ""
                            }`}
                            onClick={() => handleCategorySelection(cat.name)}
                          >
                            <span>{cat.name}</span>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </div>

                <DialogFooter className="flex justify-end">
                  <Button
                    type="button"
                    className="bg-blue-500 text-white hover:bg-blue-600"
                    onClick={applyFilters}
                    // disabled={
                    //   selectedVtubers.length === 0 &&
                    //   selectedCategories.length === 0
                    // }
                  >
                    Apply
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <main className="h max-h-max pb-10 flex-grow">
            <div className="gap-10 mt-10 mx-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredLiveStreams.length > 0 ? (
                filteredLiveStreams.sort(sortbyStatus).map((stream) => (
                  <div className="flex flex-col">
                    {currentUser?.role === "ADMIN" && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            handleDelete(stream.id);
                          }}
                          className="hover:cursor-pointer hover:underline hover:text-red-950 w-max mr-3"
                        >
                          Delete
                        </button>
                      </div>
                    )}

                    <LiveStream_Cards
                      vtube={vtubers}
                      key={stream.id}
                      title={stream.title}
                      link={stream.link}
                      thumbnail={stream.thumbnail}
                      category={stream.category}
                      status={stream.status}
                      byVtuber={stream.byVtuber}
                      vtuberIcon={stream.vtuberIcon}
                      insertType={stream.insertType}
                    />
                  </div>
                ))
              ) : (
                <p className="text-center text-white">No results found.</p>
              )}
            </div>
          </main>
        </>
      ) : !kohisfetching ? (
        <div className="h-screen bg-gradient-to-t from-palette1 via-palette3 via-90% to-palette5 flex items-center justify-center">
          <div className="text-4xl">You have to login to see content.</div>
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
