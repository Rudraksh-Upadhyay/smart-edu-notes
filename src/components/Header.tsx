import Image from "next/image";
import Link from "next/link";
import { shadow } from "../styles/utils";
import { Button } from "./ui/button";
import DarkModeToggle from "./DarkModeToggle";
import LogOutButton from "./LogOutButton";
import { getUser } from "@/auth/server";
import { SidebarTrigger } from "./ui/sidebar";

async function Header() {
    const user = await getUser();

    return (
        <header
            className="bg-popover relative flex h-24 w-full items-center justify-between px-3 sm:px-8"
            style={{
                boxShadow: shadow,
            }}
        >
            <SidebarTrigger className="absolute left-1 top-1"/>
            <Link className="flex items-end gap-2" href="/"> 
                <Image 
                    src="/logo.png" 
                    height={60} 
                    width={60} 
                    alt="logo" 
                    className="rounded-full"
                    priority
                />

                <h1 className="flex flex-col pb-1 text-2xl font-semibold leading-6 mb-3.5">
                    <span className="font-bold">SMART EDU-NOTES</span>
                </h1>
            </Link>


            <div className="flex gap-4">
                {user ? (
                    <LogOutButton/>
                ): (
                    <>
                        <Button asChild>
                            <Link href="/sign-up" className="hidden sm:block">SIGN UP</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/login">LOGIN</Link>
                        </Button>
                    </>
                )}

                <DarkModeToggle />
            </div>
        </header>
    );
}

export default Header
