# Batch 6 - CRM Dashboard + Contact Page Management

This batch focuses on developing the main CRM Dashboard with real-time statistics and adding a CMS management page for the "Contact Us" page.

> [!IMPORTANT]
> ## User Review Required
> Please review the proposed **Prisma Schema** changes below. 
> You mentioned using `SiteSettings` if possible without modifying Prisma. However, `SiteSettings` currently holds global information (email, phone, address). The Contact Us page needs specific textual content (Page Title, Page Description, Form Title, Submit Button Text, Helper Text, Hero Image, SEO metadata). Cluttering `SiteSettings` with these page-specific fields goes against the current pattern (where we have `HomePageContent` and `AboutPageContent`). 
> **Decision:** I propose creating a dedicated `ContactPageContent` model in Prisma. It is necessary for keeping the database organized and scalable. Do you approve this Prisma modification?

## Proposed Changes

### Prisma Schema
#### [MODIFY] [schema.prisma](file:///c:/Users/Rayyan%20Naht/Desktop/Naht-ERP/6-naht-platform/prisma/schema.prisma)
Add the `ContactPageContent` model:
```prisma
model ContactPageContent {
  id String @id @default("global")

  title            String  @default("تواصل معنا")
  description      String?
  formTitle        String  @default("أرسل رسالتك")
  submitButtonText String  @default("إرسال الرسالة")
  helperText       String?
  heroImage        String?

  seoTitle       String?
  seoDescription String?

  updatedAt DateTime @updatedAt
}
```

---

### CRM Dashboard
#### [MODIFY] [page.tsx](file:///c:/Users/Rayyan%20Naht/Desktop/Naht-ERP/6-naht-platform/src/app/crm/page.tsx)
Transform the dashboard to fetch and display real data:
1. **Stat Cards**: Total Leads, New Leads, Projects, Total Requests, WhatsApp Clicks, Call Clicks, Campaigns.
2. **Recent Leads Table**: Fetch the latest 5 leads with their details and project relation.
3. **Recent Requests List**: Fetch the latest Maintenance, Vendor, and Career requests and combine them into a unified timeline/list.
4. **Lead Status Summary**: Use Prisma `groupBy` to count leads by status (NEW, CONTACTED, INTERESTED, etc.) and display them as a clean summary grid or progress bars.
5. **Quick Links**: Add a section with styled buttons for common actions (Add Project, View Leads, Create Campaign, etc.).

---

### Contact Page CMS (Backend)
#### [NEW] [page.tsx](file:///c:/Users/Rayyan%20Naht/Desktop/Naht-ERP/6-naht-platform/src/app/crm/cms/contact/page.tsx)
#### [NEW] [ContactPageForm.tsx](file:///c:/Users/Rayyan%20Naht/Desktop/Naht-ERP/6-naht-platform/src/app/crm/cms/contact/ContactPageForm.tsx)
Create a new CMS page for managing the Contact Page content. The form will use `react-hot-toast` for notifications and will include an `UploadButton` for the Hero Image.

#### [MODIFY] [cms.ts](file:///c:/Users/Rayyan%20Naht/Desktop/Naht-ERP/6-naht-platform/src/actions/cms.ts)
Add `getContactPageContent` and `updateContactPageContent` server actions.

#### [MODIFY] [cms/layout.tsx](file:///c:/Users/Rayyan%20Naht/Desktop/Naht-ERP/6-naht-platform/src/app/crm/cms/layout.tsx)
Add the "صفحة تواصل معنا" link to the CMS sidebar navigation.

---

### Contact Page (Public Frontend)
#### [MODIFY] [page.tsx](file:///c:/Users/Rayyan%20Naht/Desktop/Naht-ERP/6-naht-platform/src/app/(public)/contact/page.tsx)
1. Fetch both `SiteSettings` (for the actual phone, email, address, maps) and `ContactPageContent` (for page titles, descriptions, form text).
2. Update the SEO metadata generation to use `ContactPageContent.seoTitle` and `seoDescription`.
3. Update the UI to render the dynamic text and Hero Image/Background.
4. Pass the dynamic `formTitle`, `submitButtonText`, and `helperText` as props to the existing `<ContactForm />` component without breaking its logic or Tracking.

#### [MODIFY] [ContactForm.tsx](file:///c:/Users/Rayyan%20Naht/Desktop/Naht-ERP/6-naht-platform/src/app/(public)/contact/ContactForm.tsx)
Accept new props for customizable text (e.g., `submitButtonText`, `helperText`) and apply them to the form UI. The underlying server action and UTM tracking logic will remain completely untouched.

---

## Verification Plan

### Automated Tests
- Run `npm run build` after completing all code changes to ensure type safety and successful compilation.
- Ensure Prisma schema is properly migrated `npx prisma db push`.

### Manual Verification
1. Open the CRM Dashboard and verify the numbers align with the database.
2. Go to `/crm/cms/contact`, update the text and hero image, and save.
3. Open the public `/contact` page and verify the new content appears, the SEO tags are updated, and the form still submits successfully.
