import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      actionType,
      targetContact,
      pageUrl,
      projectId,
      campaignLinkId,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      deviceType,
      userAgent,
      referrer,
      sessionId,
      visitorId,
    } = body;

    // Fast validation: at minimum we need actionType and pageUrl
    if (!actionType || !pageUrl) {
      return NextResponse.json({ status: "error", message: "Missing required tracking data" }, { status: 400 });
    }

    // Capture user IP optionally for better tracking or visitorId generation (stripped here for privacy)
    // const ip = request.headers.get("x-forwarded-for") || "unknown";

    // Non-blocking save to db to prevent slow responses if something hangs
    // However, Prisma creates are usually fast.
    await prisma.clickEvent.create({
      data: {
        actionType,
        targetContact,
        pageUrl,
        projectId,
        campaignLinkId,
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
        utmTerm,
        deviceType,
        userAgent,
        referrer,
        sessionId,
        visitorId,
      },
    });

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    // Fail silently from client perspective to avoid interrupting UX
    console.error("Tracking error:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
