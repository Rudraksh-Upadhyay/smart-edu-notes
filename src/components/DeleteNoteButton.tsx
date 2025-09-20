"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {toast} from "sonner";
import { useTransition } from "react";
import { deleteNoteAction } from "@/action/notes";

type Props  = {
    noteId: string;
    deleteNoteLocally: (noteId: string) => void;
};




function DeleteNoteButton({noteId, deleteNoteLocally}: Props) {

    const router = useRouter();
    const noteIdParams = useSearchParams().get("noteId") || "";

    const [isPending, startTransition] = useTransition();

    const handleDeleteNote =() =>{
        startTransition(async () => {
            const { errorMessage } = await deleteNoteAction(noteId);

            if (!errorMessage){
                toast.success("Note Deleted", {description: "You have successfully deleted a note"});
                deleteNoteLocally(noteId);

                if(noteId === noteIdParams){
                    router.replace("/");
                }
            }
            else{
                toast.error("Note Deletion Failed", {description: errorMessage});
            }
        });
    };


    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button className="absolute right-2 top-1/2 -translate-1/2 size-7 p-0 opacity-0 group-hover/item:opacity-100 [&_svg]:size-3" variant="ghost"><Trash2/></Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to delete this Note ? </AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete this Note.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDeleteNote}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-24">
                        {isPending ? <Loader2 className="animate-spin" /> : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default DeleteNoteButton;
