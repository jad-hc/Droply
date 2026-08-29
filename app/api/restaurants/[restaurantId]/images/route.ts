import { NextRequest, NextResponse } from "next/server";

import { requireRestaurantAccess } from "@/lib/restaurant-access";
import { supabaseAdmin } from "@/lib/supabase/server";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

type Props = {
  params: Promise<{
    restaurantId: string;
  }>;
};

export async function POST(
  request: NextRequest,
  { params }: Props
) {
  try {
    const { restaurantId } = await params;

    await requireRestaurantAccess(restaurantId);

    const formData = await request.formData();

    const file = formData.get("file");
    const folder = formData.get("folder");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "No image provided." },
        { status: 400 }
      );
    }

    if (
      folder !== "logo" &&
      folder !== "cover" &&
      folder !== "menu"
    ) {
      return NextResponse.json(
        { message: "Invalid image folder." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          message:
            "Only JPG, PNG, and WebP images are allowed.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          message: "Image must be smaller than 5 MB.",
        },
        { status: 400 }
      );
    }

    const extension =
      file.name.split(".").pop()?.toLowerCase() ?? "jpg";

    const fileName =
      `${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const filePath =
      `restaurants/${restaurantId}/${folder}/${fileName}`;

    console.log("UPLOAD PATH:", filePath);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } =
      await supabaseAdmin.storage
        .from("restaurant-images")
        .upload(filePath, buffer, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        });

    if (uploadError) {
      console.error(
        "SUPABASE UPLOAD ERROR:",
        uploadError
      );

      if (
  "statusCode" in uploadError &&
  uploadError.statusCode === "409"
)  {
        const {
          data: exists,
          error: existsError,
        } =
          await supabaseAdmin.storage
            .from("restaurant-images")
            .exists(filePath);

        console.log("FILE EXISTS AFTER 409:", {
          exists,
          existsError,
          filePath,
        });

        if (exists && !existsError) {
          const { data: publicUrlData } =
            supabaseAdmin.storage
              .from("restaurant-images")
              .getPublicUrl(filePath);

          return NextResponse.json({
            url: publicUrlData.publicUrl,
            path: filePath,
          });
        }
      }

      return NextResponse.json(
        {
          message:
            uploadError.message ??
            "Failed to upload image.",
        },
        { status: 500 }
      );
    }

    console.log(
      "SUPABASE UPLOAD SUCCESS:",
      uploadData
    );

    const { data: publicUrlData } =
      supabaseAdmin.storage
        .from("restaurant-images")
        .getPublicUrl(uploadData.path);

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      path: uploadData.path,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "You are not allowed to upload images for this restaurant.",
      },
      { status: 403 }
    );
  }
}