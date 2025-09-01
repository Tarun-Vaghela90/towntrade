import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function Modal({
  title,
  buttonName,
  children,
  buttonDesign,
  ContentClassName,
}) {
  const [open, setOpen] = useState(false);

  const closeModal = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={
            buttonDesign ||
            "px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          }
        >
          {buttonName}
        </Button>
      </DialogTrigger>

      <DialogContent className={ContentClassName}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {typeof children === "function" ? children({ closeModal }) : children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
