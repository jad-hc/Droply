"use client";

import { ChangeEvent, useState } from "react";

type ImageUploadProps = {
  name: string;
  label: string;
  restaurantId: string;
  folder: "logo" | "cover" | "menu";
  initialValue?: string | null;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export function ImageUpload({
  name,
  label,
  restaurantId,
  folder,
  initialValue,
}: ImageUploadProps) {
  // Ensure the initial state is never undefined
  const [imageUrl, setImageUrl] = useState(initialValue ?? "");

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    if (isUploading) {
      return;
    }
    
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPG, PNG, and WebP images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch(
        `/api/restaurants/${restaurantId}/images`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Failed to upload image.");
      }

      // Safely extract the path/url, falling back to an empty string to prevent the React warning
      const uploadedPath = data.url || data.data?.path || data.data?.fullPath || "";
      setImageUrl(uploadedPath);
      
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to upload image."
      );
    } finally {
      setIsUploading(false);
      // Safely reset the uncontrolled file input
      event.target.value = "";
    }
  }

  function handleRemove() {
    setImageUrl("");
    setError("");
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">{label}</label>

      {imageUrl && (
        <div className="overflow-hidden rounded-lg border">
          {/* Note: if imageUrl is just a path, you might need to prepend your Supabase URL here */}
          <img
            src={imageUrl}
            alt={label}
            className="h-48 w-full object-cover"
          />
        </div>
      )}

      {/* Force fallback to "" just in case, ensuring it is strictly controlled */}
      <input 
        type="hidden" 
        name={name} 
        value={imageUrl || ""} 
      />

      <div className="flex flex-wrap gap-3">
        <label className="cursor-pointer rounded-md border px-4 py-2 text-sm hover:bg-muted">
          {isUploading
            ? "Uploading..."
            : imageUrl
              ? "Change image"
              : "Upload image"}

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={isUploading}
            onChange={handleUpload}
            className="hidden"
          />
        </label>

        {imageUrl && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={isUploading}
            className="rounded-md border px-4 py-2 text-sm disabled:opacity-50"
          >
            Remove
          </button>
        )}
      </div>

      {isUploading && (
        <p className="text-sm text-muted-foreground">
          Uploading image...
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}