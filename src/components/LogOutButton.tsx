"use client";

import { useState } from "react"
import { Button } from "./ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation";
import { logOutAction } from "@/action/users";

function LogOutButton() {
    

    const [loading, setLoading] = useState(false); 

    const router = useRouter()
 
    const handleLogOut = async () => {
        setLoading(true)

        const { errorMessage } = await logOutAction();

        if(!errorMessage){
            toast.success("Logged Out Succesfully",{
                description: "You have successfully logged out",
            });
            router.push("/");
        }else{
            toast.error("Logout Failed", {
                description: errorMessage,
            })
        }

        setLoading(false)
        console.log("Logging out...");
    };

    return (
        <Button className="w-22" variant="outline" onClick={handleLogOut} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" />  : "Log Out"}
        </Button>
    );
}
    

export default LogOutButton;
