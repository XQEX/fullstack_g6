import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Home, ShoppingCart } from "lucide-react";
import Link from "next/link";



export default function ShopNav() {
    return (
        <header className="sticky top-0 z-50 bg-white shadow-2xl">
        <div className="flex items-center h-16 px-4">
          <Link href="/shop" className="flex items-center space-x-2">
            <span className="text-pink-500">
              <span className="font-bold select-none">Pixela WorldEnd FC</span> <span className="select-none font-light"> Shop</span>
            </span>
          </Link>
          <div className="ml-4 flex-grow">
            <Input
              type="search"
              placeholder="Search here"
              className="text-black w-full max-w-xl rounded-lg border-pink-500 placeholder-pink-500"
            />
          </div>
          <div>
            <nav className="flex items-center space-x-4">
              <Link href="/" className="text-black">
              <Button
                  variant="ghost"
                  size="icon"
                  className="text-pink-500 hover:text-pink-400"
                >
                  <Home className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/shop/cart">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-pink-500 hover:text-pink-400"
                >
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar className="">
                    <AvatarImage src="/img/montfort.jpg"></AvatarImage>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Castle</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/profile">
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                  </Link>
                  <Link href="/settings">
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                  </Link>
                  <Link href="/logout">
                    <DropdownMenuItem>Logout</DropdownMenuItem>{" "}
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>
        </div>
      </header>
    )
}