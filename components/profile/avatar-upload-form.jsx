"use client";

import { useRef, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Camera, Trash2 } from "lucide-react";
import { uploadAvatar, removeAvatar } from "@/lib/actions/profile-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

function initials(name) {
  if (!name) return "?";
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function AvatarUploadForm({ name, image }) {
  const { update } = useSession();
  const [preview, setPreview] = useState(image ?? null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast.error("Image is too large — please choose one under 1MB.");
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);
    startTransition(async () => {
      const result = await uploadAvatar(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      setPreview(result.image);
      await update({ image: result.image });
      toast.success("Profile photo updated.");
    });
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await removeAvatar();
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      setPreview(null);
      await update({ image: null });
      toast.success("Profile photo removed.");
    });
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16">
        {preview ? <AvatarImage src={preview} alt={name} /> : null}
        <AvatarFallback className="text-lg">{initials(name)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="mr-1.5 h-3.5 w-3.5" /> Change photo
          </Button>
          {preview ? (
            <Button type="button" variant="ghost" size="sm" disabled={isPending} onClick={handleRemove}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Remove
            </Button>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">JPG or PNG, up to 1MB.</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isPending}
      />
    </div>
  );
}
