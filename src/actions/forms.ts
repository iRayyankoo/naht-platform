"use server";

import { prisma } from "@/lib/prisma";

// Basic email validation
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function parseOptionalString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  throw new Error("القيمة المدخلة ليست نصاً صالحاً");
}

function parseRequiredString(value: unknown, fieldName: string): string {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length > 0) return trimmed;
  }
  throw new Error(`حقل ${fieldName} مطلوب ويجب أن يكون نصاً صالحاً`);
}

function parseOptionalNumber(value: unknown, fieldName: string): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") {
    if (Number.isFinite(value)) return value;
    throw new Error(`حقل ${fieldName} يجب أن يكون رقماً صالحاً`);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) return null;
    const num = Number(trimmed);
    if (Number.isFinite(num)) return num;
  }
  throw new Error(`حقل ${fieldName} يجب أن يكون رقماً صالحاً`);
}

function parseOptionalNonNegativeInteger(value: unknown, fieldName: string): number | null {
  const num = parseOptionalNumber(value, fieldName);
  if (num === null) return null;
  if (Number.isInteger(num) && num >= 0) return num;
  throw new Error(`حقل ${fieldName} يجب أن يكون عدداً صحيحاً غير سالب`);
}

export interface ContactUsPayload {
  name?: unknown;
  phone?: unknown;
  inquiryType?: unknown;
  message?: unknown;
  email?: unknown;
  utmSource?: unknown;
  utmMedium?: unknown;
  utmCampaign?: unknown;
  utmContent?: unknown;
  utmTerm?: unknown;
  landingPageUrl?: unknown;
  [key: string]: unknown;
}

export interface OpportunityPayload {
  name?: unknown;
  phone?: unknown;
  opportunityType?: unknown;
  city?: unknown;
  district?: unknown;
  email?: unknown;
  propertyLocation?: unknown;
  landArea?: unknown;
  propertyOwnership?: unknown;
  notes?: unknown;
  [key: string]: unknown;
}

export interface MaintenancePayload {
  fullName?: unknown;
  phone?: unknown;
  issueType?: unknown;
  description?: unknown;
  email?: unknown;
  projectOrUnit?: unknown;
  attachmentUrl?: unknown;
  contactTime?: unknown;
  [key: string]: unknown;
}

export interface VendorPayload {
  companyName?: unknown;
  contactPerson?: unknown;
  phone?: unknown;
  email?: unknown;
  vendorType?: unknown;
  specialty?: unknown;
  commercialRecord?: unknown;
  city?: unknown;
  companyProfile?: unknown;
  notes?: unknown;
  [key: string]: unknown;
}

export interface CareerPayload {
  fullName?: unknown;
  phone?: unknown;
  email?: unknown;
  position?: unknown;
  resumeUrl?: unknown;
  experienceYears?: unknown;
  city?: unknown;
  linkedInUrl?: unknown;
  notes?: unknown;
  [key: string]: unknown;
}

export async function submitContactUs(data: ContactUsPayload) {
  const name = parseRequiredString(data.name, "الاسم");
  const phone = parseRequiredString(data.phone, "رقم الجوال");
  const inquiryType = parseRequiredString(data.inquiryType, "نوع الاستفسار");
  const message = parseRequiredString(data.message, "الرسالة");

  const email = parseOptionalString(data.email);
  const utmSource = parseOptionalString(data.utmSource);
  const utmMedium = parseOptionalString(data.utmMedium);
  const utmCampaign = parseOptionalString(data.utmCampaign);
  const utmContent = parseOptionalString(data.utmContent);
  const utmTerm = parseOptionalString(data.utmTerm);
  const landingPageUrl = parseOptionalString(data.landingPageUrl);

  await prisma.lead.create({
    data: {
      name,
      phone,
      email,
      formType: "GENERAL",
      leadType: "CONTACT_US",
      opportunityType: inquiryType,
      message,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      landingPageUrl,
      status: "NEW",
    }
  });

  return { success: true };
}

export async function submitOpportunity(data: OpportunityPayload) {
  const name = parseRequiredString(data.name, "الاسم");
  const phone = parseRequiredString(data.phone, "رقم الجوال");
  const opportunityType = parseRequiredString(data.opportunityType, "نوع الفرصة");
  const city = parseRequiredString(data.city, "المدينة");
  const district = parseRequiredString(data.district, "الحي");

  const email = parseOptionalString(data.email);
  const propertyLocation = parseOptionalString(data.propertyLocation);
  const landArea = parseOptionalNumber(data.landArea, "مساحة الأرض");
  const propertyOwnership = parseOptionalString(data.propertyOwnership);
  const message = parseOptionalString(data.notes);

  await prisma.lead.create({
    data: {
      name,
      phone,
      email,
      formType: "GENERAL",
      leadType: "REAL_ESTATE_OPPORTUNITY",
      opportunityType,
      city,
      district,
      propertyLocation,
      landArea,
      propertyOwnership,
      message,
      status: "NEW",
    }
  });

  return { success: true };
}

export async function submitMaintenance(data: MaintenancePayload) {
  const fullName = parseRequiredString(data.fullName, "الاسم الكامل");
  const phone = parseRequiredString(data.phone, "رقم الجوال");
  const issueType = parseRequiredString(data.issueType, "نوع المشكلة");
  const description = parseRequiredString(data.description, "وصف المشكلة");

  const email = parseOptionalString(data.email);
  const projectOrUnit = parseOptionalString(data.projectOrUnit);
  const attachmentUrl = parseOptionalString(data.attachmentUrl);
  const contactTime = parseOptionalString(data.contactTime);
  const notes = contactTime ? `الوقت المناسب للتواصل: ${contactTime}` : null;

  await prisma.maintenanceRequest.create({
    data: {
      fullName,
      phone,
      email,
      projectOrUnit,
      issueType,
      description,
      attachmentUrl,
      notes,
      status: "NEW",
    }
  });

  return { success: true };
}

export async function submitVendor(data: VendorPayload) {
  const companyName = parseRequiredString(data.companyName, "اسم الشركة");
  const contactPerson = parseRequiredString(data.contactPerson, "الشخص المسؤول");
  const phone = parseRequiredString(data.phone, "رقم الجوال");
  const email = parseRequiredString(data.email, "البريد الإلكتروني");
  const vendorType = parseRequiredString(data.vendorType, "نوع المورد");
  const specialty = parseRequiredString(data.specialty, "التخصص");

  if (!isValidEmail(email)) {
    throw new Error("البريد الإلكتروني غير صالح");
  }

  const commercialRecord = parseOptionalString(data.commercialRecord);
  const city = parseOptionalString(data.city);
  const companyProfile = parseOptionalString(data.companyProfile);
  const notes = parseOptionalString(data.notes);

  await prisma.vendorApplication.create({
    data: {
      companyName,
      contactPerson,
      phone,
      email,
      vendorType,
      specialty,
      commercialRecord,
      city,
      companyProfile,
      notes,
      status: "NEW",
    }
  });

  return { success: true };
}

export async function submitCareer(data: CareerPayload) {
  const fullName = parseRequiredString(data.fullName, "الاسم الكامل");
  const phone = parseRequiredString(data.phone, "رقم الجوال");
  const email = parseRequiredString(data.email, "البريد الإلكتروني");
  const position = parseRequiredString(data.position, "الوظيفة المتقدم لها");
  const resumeUrl = parseRequiredString(data.resumeUrl, "رابط السيرة الذاتية");

  if (!isValidEmail(email)) {
    throw new Error("البريد الإلكتروني غير صالح");
  }

  const experienceYears = parseOptionalNonNegativeInteger(data.experienceYears, "سنوات الخبرة");
  const city = parseOptionalString(data.city);
  const linkedInUrl = parseOptionalString(data.linkedInUrl);
  const notes = parseOptionalString(data.notes);

  await prisma.jobApplication.create({
    data: {
      fullName,
      phone,
      email,
      position,
      experienceYears,
      city,
      linkedInUrl,
      resumeUrl,
      notes,
      status: "NEW",
    }
  });

  return { success: true };
}
