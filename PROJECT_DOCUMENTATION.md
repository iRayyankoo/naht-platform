# Naht Platform (ERP, CRM, and CMS)

## Overview
A comprehensive property management, sales, and content management platform for Naht Real Estate. Built with Next.js 15, React, Tailwind CSS, and Prisma (PostgreSQL).

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Database:** PostgreSQL (via Supabase) + Prisma ORM
- **Styling:** Tailwind CSS + Custom CSS modules
- **Authentication:** NextAuth.js (Session-based)
- **File Storage:** Local for now (Planned Cloudflare R2)

---

## Current Status After Batch 4 Revision (Revision 2)

### Where We Are Now
We have successfully completed all core features up to **Batch 4 (Revision 2)**. The platform is currently fully functional locally on the `ui-refinements` branch. We have deliberately paused before entering Phase 7 (Hosting & Deployment) to ensure all features meet the premium standard required.

### Branch Status
- **Current Branch:** `ui-refinements`
- **State:** Stable, tested, and backed up.

### What Has Been Accomplished:

**Batch 1 (Admin & Sidebar Refinement):**
- Rebuilt the CRM sidebar (`CrmSidebar.tsx`) to be robust, modern, and expandable.
- Implemented smooth transitions, proper active states, and categorized navigation (Sales, Marketing, Content, Settings).

**Batch 2 (Leads System & UI):**
- Redesigned the Leads table to display more context (Source, Temperature, Next Action).
- Refined the individual Lead details page (`/crm/leads/[id]`) to act as a proper CRM dashboard (showing follow-ups, timeline, and internal notes).
- Ensured seamless status transitions.

**Batch 3 (Public Forms & CRM Requests):**
- Polished all public-facing forms (Contact, Maintenance, Vendors, Careers, Opportunity).
- Unified form layouts with clear indicators for required fields, better spacing, and loading states.
- Created and linked dedicated CRM detail pages for all request types (e.g., `/crm/requests/maintenance/[id]`).
- Fixed Next.js 15 routing issues (`await params.id`) to ensure no runtime errors when accessing details.

**Batch 4 (Premium Public Website Redesign):**
- **Revision 1 & 2:** Redesigned the homepage to match the luxury aesthetics of top-tier real estate developers.
- **Hero Section:** Dark overlay, massive typography, transparent header on scroll, and a smart media background.
- **Featured Projects:** Massive portfolio-style layout for the top project, with a sleek grid for the rest. Added a fallback to show latest projects if none are marked as featured.
- **About Brief:** Grayscale imagery that regains color on hover, set against a deep dark background.
- **Project Types (Communities):** Replaced generic SaaS icons with deep, abstract image cards representing communities.
- **Stats & Why Choose Us:** Elegant serif numbers and subtle background numbering.
- **Navbar:** Transparent on the top of the homepage, solid white elsewhere.

### Latest Feature: Smart Hero Slider
The Hero section background is now fully controllable via the CMS (`/crm/cms/homepage`) without any Prisma schema modifications.
- **How to edit:** Go to `/crm/cms/homepage` and look for the "الوسائط" (Media) field.
- **Single Image:** Paste a single image URL.
- **Video:** Paste a single URL ending in `.mp4`. It will auto-play muted in the background.
- **Slider:** Paste multiple image URLs (each on a new line or separated by commas). The Hero will automatically turn into a smooth, auto-playing slider.

### Status of Features
- **Featured Projects:** Working perfectly. Uses a fallback mechanism.
- **Tracking & Forms:** Untouched and fully operational. `TrackedButton` and `TrackedForm` continue to send precise UTM parameters and click events to the CRM.
- **CRM:** Fully operational.

### Important Note on Deliberate Omissions
As per strict user instructions:
- **No Supabase/Vercel/Cloudflare R2** integration has been initialized yet.
- **No DNS** changes have been made.
- **No merging** into `main` or `master`.
- **No Prisma** schema modifications were made for the slider (we creatively used the existing `heroBackgroundImage` string field).
