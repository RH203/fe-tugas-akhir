"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShieldCheck, LogOut, Clapperboard, User, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  const { data: session } = useSession();

  // Helper untuk mendapatkan inisial nama
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* --- Logo / Brand --- */}
        <Link href="/">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <span>
              Tugas<span className="text-primary"> Akhir</span>
            </span>
          </div>
        </Link>

        {/* --- Navigation --- */}
        <div className="flex items-center gap-4">
          
          {/* BELUM LOGIN */}
          {!session && (
            <>
              <Link href="/auth/login">
                <Button variant="ghost">Masuk</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Daftar</Button>
              </Link>
            </>
          )}

          {/* SUDAH LOGIN */}
          {session && (
            <div className="flex items-center gap-4">
              
              {/* Menu Navigasi Utama  */}
              <Link href="/channel/video">
                <Button variant="ghost" className="gap-2 hidden md:flex">
                  <Clapperboard className="w-4 h-4" />
                  Video Saya
                </Button>
              </Link>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-9 w-9 border">
                      <AvatarImage 
                        src={session.user?.image || ""} 
                        alt={session.user?.name || "User"} 
                      />
                      <AvatarFallback>{getInitials(session.user?.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Menu Item: Video*/}
                  <DropdownMenuItem asChild>
                    <Link href="/channel/video" className="cursor-pointer w-full flex items-center">
                      <Clapperboard className="mr-2 h-4 w-4" />
                      <span>Video Saya</span>
                    </Link>
                  </DropdownMenuItem>

                  {/* Menu Item: Profile  */}
                  <DropdownMenuItem disabled>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil (Coming Soon)</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Menu Item: Logout */}
                  <DropdownMenuItem 
                    onClick={() => signOut({ callbackUrl: "/auth/login" })}
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Keluar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}