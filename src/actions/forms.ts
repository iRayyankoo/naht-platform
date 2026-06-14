"use server";

import { prisma } from "@/lib/prisma";

// Basic email validation
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export async function submitContactUs(data: any) {
  if (!data.name || !data.phone || !data.inquiryType || !data.message) {
    throw new Error("جميع الحقول الإجبارية مطلوبة");
  }

  await prisma.lead.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      formType: "GENERAL",
      leadType: "CONTACT_US",
      opportunityType: data.inquiryType,
      message: data.message,
      utmSource: data.utmSource || null,
      utmMedium: data.utmMedium || null,
      utmCampaign: data.utmCampaign || null,
      utmContent: data.utmContent || null,
      utmTerm: data.utmTerm || null,
      landingPageUrl: data.landingPageUrl || null,
      status: "NEW",
    }
  });

  return { success: true };
}

export async function submitOpportunity(data: any) {
  if (!data.name || !data.phone || !data.opportunityType || !data.city || !data.district) {
    throw new Error("جميع الحقول الإجبارية مطلوبة");
  }

  await prisma.lead.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      formType: "GENERAL",
      leadType: "REAL_ESTATE_OPPORTUNITY",
      opportunityType: data.opportunityType,
      city: data.city,
      district: data.district,
      propertyLocation: data.propertyLocation || null,
      landArea: data.landArea ? parseFloat(data.landArea) : null,
      propertyOwnership: data.propertyOwnership || null,
      message: data.notes || null,
      status: "NEW",
    }
  });

  return { success: true };
}

export async function submitMaintenance(data: any) {
  if (!data.fullName || !data.phone || !data.issueType || !data.description) {
    throw new Error("جميع الحقول الإجبارية مطلوبة");
  }

  await prisma.maintenanceRequest.create({
    data: {
      fullName: data.fullName,
      phone: data.phone,
      email: data.email || null,
      projectOrUnit: data.projectOrUnit || null,
      issueType: data.issueType,
      description: data.description,
      attachmentUrl: data.attachmentUrl || null,
      notes: data.contactTime ? `الوقت المناسب للتواصل: ${data.contactTime}` : null,
      status: "NEW",
    }
  });

  return { success: true };
}

export async function submitVendor(data: any) {
  if (!data.companyName || !data.contactPerson || !data.phone || !data.email || !data.vendorType || !data.specialty) {
    throw new Error("جميع الحقول الإجبارية مطلوبة");
  }

  if (!isValidEmail(data.email)) {
    throw new Error("البريد الإلكتروني غير صالح");
  }

  await prisma.vendorApplication.create({
    data: {
      companyName: data.companyName,
      contactPerson: data.contactPerson,
      phone: data.phone,
      email: data.email,
      vendorType: data.vendorType,
      specialty: data.specialty,
      commercialRecord: data.commercialRecord || null,
      city: data.city || null,
      companyProfile: data.companyProfile || null,
      notes: data.notes || null,
      status: "NEW",
    }
  });

  return { success: true };
}

export async function submitCareer(data: any) {
  if (!data.fullName || !data.phone || !data.email || !data.position || !data.resumeUrl) {
    throw new Error("جميع الحقول الإجبارية مطلوبة، بما في ذلك السيرة الذاتية");
  }

  if (!isValidEmail(data.email)) {
    throw new Error("البريد الإلكتروني غير صالح");
  }

  await prisma.jobApplication.create({
    data: {
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      position: data.position,
      experienceYears: data.experienceYears ? parseInt(data.experienceYears) : null,
      city: data.city || null,
      linkedInUrl: data.linkedInUrl || null,
      resumeUrl: data.resumeUrl,
      notes: data.notes || null,
      status: "NEW",
    }
  });

  return { success: true };
}
