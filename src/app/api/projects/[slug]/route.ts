import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug;
    const project = await prisma.project.findUnique({
      where: {
        slug: slug,
        isVisible: true,
      },
      include: {
        units: {
          where: {
            isVisible: true,
            status: "AVAILABLE",
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ status: "error", message: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ status: "success", data: project });
  } catch (error) {
    return NextResponse.json({ status: "error", message: "Failed to fetch project details" }, { status: 500 });
  }
}
