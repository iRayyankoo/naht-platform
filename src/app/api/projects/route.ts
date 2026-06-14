import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const isFeatured = searchParams.get("featured") === "true";

    const projects = await prisma.project.findMany({
      where: {
        isVisible: true,
        ...(isFeatured ? { isFeatured: true } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        slug: true,
        name: true,
        type: true,
        city: true,
        neighborhood: true,
        status: true,
        shortDesc: true,
        mainImage: true,
        isFeatured: true,
      },
    });

    return NextResponse.json({ status: "success", data: projects });
  } catch (error) {
    return NextResponse.json({ status: "error", message: "Failed to fetch projects" }, { status: 500 });
  }
}
