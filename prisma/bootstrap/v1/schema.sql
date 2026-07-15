-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MARKETING', 'SALES', 'VIEWER');

-- CreateEnum
CREATE TYPE "NavigationLocation" AS ENUM ('HEADER', 'FOOTER', 'BOTH');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'INVITED', 'SUSPENDED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'SALES',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "phone" TEXT,
    "jobTitle" TEXT,
    "departmentId" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "shortDesc" TEXT,
    "fullDesc" TEXT,
    "mainImage" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "area" DOUBLE PRECISION,
    "price" DOUBLE PRECISION,
    "rooms" INTEGER,
    "baths" INTEGER,
    "progressPercent" INTEGER,
    "progressLabel" TEXT,
    "googleMapsUrl" TEXT,
    "locationText" TEXT,
    "pdfUrl" TEXT,
    "showOnHomeMap" BOOLEAN NOT NULL DEFAULT false,
    "mapLat" DOUBLE PRECISION,
    "mapLng" DOUBLE PRECISION,
    "mapX" DOUBLE PRECISION,
    "mapY" DOUBLE PRECISION,
    "planImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectFeature" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "desc" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProjectFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectWarranty" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "desc" TEXT,
    "duration" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProjectWarranty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectGalleryImage" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProjectGalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectModel" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "planImage" TEXT,
    "area" TEXT,
    "rooms" INTEGER,
    "baths" INTEGER,
    "status" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "unitNum" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "rooms" INTEGER NOT NULL,
    "baths" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "modelId" TEXT,
    "floor" TEXT,
    "facade" TEXT,
    "unitPlanImage" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "projectId" TEXT,
    "formType" TEXT NOT NULL,
    "source" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmContent" TEXT,
    "utmTerm" TEXT,
    "landingPageUrl" TEXT,
    "referrer" TEXT,
    "deviceType" TEXT,
    "platform" TEXT,
    "message" TEXT,
    "budget" TEXT,
    "propertyType" TEXT,
    "preferredContactMethod" TEXT,
    "preferredContactTime" TEXT,
    "city" TEXT,
    "district" TEXT,
    "consent" BOOLEAN NOT NULL DEFAULT true,
    "leadTemperature" TEXT,
    "assignedToId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "leadType" TEXT NOT NULL DEFAULT 'GENERAL',
    "opportunityType" TEXT,
    "propertyLocation" TEXT,
    "landArea" DOUBLE PRECISION,
    "propertyOwnership" TEXT,
    "followUpDate" TIMESTAMP(3),
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadNote" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "noteType" TEXT NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignLink" (
    "id" TEXT NOT NULL,
    "shortCode" TEXT,
    "campaignName" TEXT NOT NULL,
    "destinationUrl" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "utmSource" TEXT NOT NULL,
    "utmMedium" TEXT NOT NULL,
    "utmCampaign" TEXT NOT NULL,
    "utmContent" TEXT,
    "utmTerm" TEXT,
    "finalUrl" TEXT NOT NULL,
    "notes" TEXT,
    "projectId" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClickEvent" (
    "id" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "targetContact" TEXT,
    "pageUrl" TEXT NOT NULL,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmContent" TEXT,
    "utmTerm" TEXT,
    "deviceType" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "sessionId" TEXT,
    "visitorId" TEXT,
    "projectId" TEXT,
    "campaignLinkId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClickEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "siteName" TEXT NOT NULL DEFAULT 'Ï┤Ï▒┘âÏ® ┘åÏ¡Ï¬ Ïº┘äÏúÏÁ┘ê┘ä Ïº┘äÏ╣┘éÏºÏ▒┘èÏ®',
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "whatsappNumber" TEXT,
    "address" TEXT,
    "googleMapsUrl" TEXT,
    "workingHours" TEXT,
    "footerText" TEXT,
    "copyrightText" TEXT,
    "defaultSeoTitle" TEXT,
    "defaultSeoDescription" TEXT,
    "defaultOgImage" TEXT,
    "canonicalBaseUrl" TEXT,
    "defaultRobotsIndex" BOOLEAN NOT NULL DEFAULT true,
    "logoDarkUrl" TEXT,
    "brandTagline" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "accentColor" TEXT,
    "darkBgColor" TEXT,
    "buttonColor" TEXT,
    "textColor" TEXT,
    "borderColor" TEXT,
    "footerCompanyName" TEXT,
    "footerDescription" TEXT,
    "footerLogoUrl" TEXT,
    "showFooterLogo" BOOLEAN NOT NULL DEFAULT true,
    "showImportantLinks" BOOLEAN NOT NULL DEFAULT true,
    "showContactInfo" BOOLEAN NOT NULL DEFAULT true,
    "showEmployeePortal" BOOLEAN NOT NULL DEFAULT true,
    "showSocialLinks" BOOLEAN NOT NULL DEFAULT true,
    "headerCtaText" TEXT DEFAULT 'Ï¿┘êÏºÏ¿Ï® Ïº┘äÏ┤Ï▒┘âÏºÏí',
    "headerCtaUrl" TEXT DEFAULT '/auth/login',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterLink" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isExternal" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FooterLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackingSettings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "gtmId" TEXT,
    "isGtmEnabled" BOOLEAN NOT NULL DEFAULT false,
    "ga4MeasurementId" TEXT,
    "isGa4Enabled" BOOLEAN NOT NULL DEFAULT false,
    "googleAdsId" TEXT,
    "googleAdsConversionLabel" TEXT,
    "isGoogleAdsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "metaPixelId" TEXT,
    "isMetaPixelEnabled" BOOLEAN NOT NULL DEFAULT false,
    "tiktokPixelId" TEXT,
    "isTiktokPixelEnabled" BOOLEAN NOT NULL DEFAULT false,
    "snapchatPixelId" TEXT,
    "isSnapchatPixelEnabled" BOOLEAN NOT NULL DEFAULT false,
    "linkedinPartnerId" TEXT,
    "isLinkedinEnabled" BOOLEAN NOT NULL DEFAULT false,
    "xPixelId" TEXT,
    "isXPixelEnabled" BOOLEAN NOT NULL DEFAULT false,
    "customHeadScript" TEXT,
    "customBodyStartScript" TEXT,
    "customBodyEndScript" TEXT,
    "isCustomScriptsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrackingSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialLink" (
    "id" TEXT NOT NULL,
    "platformName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomePageContent" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "heroDisplayMode" TEXT NOT NULL DEFAULT 'classic',
    "heroTitle" TEXT NOT NULL DEFAULT '┘åÏ¡Ï¬ Ïº┘äÏúÏÁ┘ê┘ä Ïº┘äÏ╣┘éÏºÏ▒┘èÏ®',
    "heroSubtitle" TEXT NOT NULL DEFAULT '┘åÏ¿┘å┘è ┘àÏ│Ï¬┘éÏ¿┘ä Ïº┘äÏÑÏ│┘âÏº┘å Ï¿ÏúÏ╣┘ä┘ë ┘àÏ╣Ïº┘è┘èÏ▒ Ïº┘äÏ¼┘êÏ»Ï®',
    "heroBackgroundImage" TEXT,
    "ctaButtonText" TEXT NOT NULL DEFAULT 'Ï¬ÏÁ┘üÏ¡ ┘àÏ┤ÏºÏ▒┘èÏ╣┘åÏº',
    "ctaButtonUrl" TEXT NOT NULL DEFAULT '/projects',
    "statsTitle" TEXT,
    "stat1Label" TEXT,
    "stat1Value" TEXT,
    "stat2Label" TEXT,
    "stat2Value" TEXT,
    "stat3Label" TEXT,
    "stat3Value" TEXT,
    "whyNahtTitle" TEXT,
    "whyNahtDescription" TEXT,
    "aboutBriefTitle" TEXT,
    "aboutBriefText" TEXT,
    "aboutBriefImage" TEXT,
    "nahtStandardTitle" TEXT DEFAULT 'The Naht Standard',
    "nahtStandardSubtitle" TEXT DEFAULT '┘åÏ▒Ï¬┘é┘è Ï¿┘à┘ü┘ç┘ê┘à Ïº┘äÏ¬ÏÀ┘ê┘èÏ▒ Ïº┘äÏ╣┘éÏºÏ▒┘è.',
    "nahtStandardDescription" TEXT DEFAULT '┘å┘äÏ¬Ï▓┘à ┘ü┘è "┘åÏ¡Ï¬" Ï¿ÏúÏ╣┘ä┘ë ┘àÏ╣Ïº┘è┘èÏ▒ Ïº┘äÏ¼┘êÏ»Ï® Ïº┘äÏ╣Ïº┘ä┘à┘èÏ®Ïî Ï¡┘èÏ½ ┘åÏ»┘àÏ¼ Ï¿┘è┘å Ïº┘äÏ¬ÏÁ┘à┘è┘à Ïº┘ä┘àÏ╣┘àÏºÏ▒┘è Ïº┘äÏ╣Ï¿┘éÏ▒┘èÏî ┘êÏºÏ│Ï¬Ï»Ïº┘àÏ® Ïº┘äÏ¬┘å┘ü┘èÏ░Ïî ┘êÏºÏ«Ï¬┘èÏºÏ▒ Ïú┘à┘èÏ▓ Ïº┘ä┘à┘êÏº┘éÏ╣ ┘ä┘åÏ«┘ä┘é ÏúÏÁ┘ê┘äÏº┘ï Ï╣┘éÏºÏ▒┘èÏ® Ï¬Ï¬┘êÏºÏ▒Ï½┘çÏº Ïº┘äÏúÏ¼┘èÏº┘ä.',
    "nahtFeature1Title" TEXT DEFAULT '┘à┘êÏº┘éÏ╣ ÏºÏ│Ï¬Ï▒ÏºÏ¬┘èÏ¼┘èÏ®',
    "nahtFeature1Desc" TEXT DEFAULT 'Ïº┘åÏ¬┘éÏºÏí Ï»┘é┘è┘é ┘äÏúÏ▒┘é┘ë Ïº┘äÏúÏ¡┘èÏºÏí ┘êÏú┘âÏ½Ï▒┘çÏº ┘å┘à┘êÏº┘ï ┘äÏÂ┘àÏº┘å Ï¼┘êÏ»Ï® Ïº┘äÏ¡┘èÏºÏ® ┘êÏº┘äÏ╣ÏºÏªÏ» Ïº┘äÏºÏ│Ï¬Ï½┘àÏºÏ▒┘è.',
    "nahtFeature2Title" TEXT DEFAULT 'Ï¼┘êÏ»Ï® Ïº┘äÏ¿┘åÏºÏí',
    "nahtFeature2Desc" TEXT DEFAULT 'ÏºÏ│Ï¬Ï«Ï»Ïº┘à Ïú┘üÏÂ┘ä Ïº┘ä┘à┘êÏºÏ» ┘êÏ¬ÏÀÏ¿┘è┘é ÏúÏ»┘é ┘àÏ╣Ïº┘è┘èÏ▒ Ïº┘ä┘â┘êÏ» Ïº┘äÏ│Ï╣┘êÏ»┘è ┘ä┘äÏ¿┘åÏºÏí.',
    "nahtFeature3Title" TEXT DEFAULT 'Ï¬ÏÁÏº┘à┘è┘à ÏºÏ│Ï¬Ï½┘åÏºÏª┘èÏ®',
    "nahtFeature3Desc" TEXT DEFAULT '┘êÏºÏ¼┘çÏºÏ¬ Ï╣ÏÁÏ▒┘èÏ® ┘êÏ¬┘éÏ│┘è┘àÏºÏ¬ Ï»ÏºÏ«┘ä┘èÏ® Ï░┘â┘èÏ® Ï¬┘äÏ¿┘è Ï¬ÏÀ┘äÏ╣ÏºÏ¬ Ïº┘äÏ╣ÏºÏª┘äÏ® Ïº┘äÏ╣ÏÁÏ▒┘èÏ®.',
    "nahtFeature4Title" TEXT DEFAULT 'ÏÂ┘àÏº┘åÏºÏ¬ ┘à┘àÏ¬Ï»Ï®',
    "nahtFeature4Desc" TEXT DEFAULT '┘å┘éÏ»┘à ÏÂ┘àÏº┘åÏºÏ¬ Ï¡┘é┘è┘é┘èÏ® Ï¬┘àÏ¬Ï» ┘äÏ│┘å┘êÏºÏ¬ ┘äÏ¡┘àÏº┘èÏ® ÏºÏ│Ï¬Ï½┘àÏºÏ▒┘â ┘êÏ▒ÏºÏ¡Ï¬┘â.',
    "showMapSection" BOOLEAN NOT NULL DEFAULT true,
    "mapSectionTitle" TEXT,
    "mapSectionDesc" TEXT,
    "mapMode" TEXT DEFAULT 'geographic',
    "mapCenterLat" DOUBLE PRECISION DEFAULT 24.7136,
    "mapCenterLng" DOUBLE PRECISION DEFAULT 46.6753,
    "mapZoom" INTEGER DEFAULT 5,
    "mapBackgroundImage" TEXT,
    "pinColorAvailable" TEXT DEFAULT '#B5B693',
    "pinColorSold" TEXT DEFAULT '#4E4949',
    "pinColorComingSoon" TEXT DEFAULT '#C5B59C',
    "pinColorUnderConstruction" TEXT DEFAULT '#A6937C',
    "pinColorDefault" TEXT DEFAULT '#A6937C',
    "pinLogoUrl" TEXT,
    "pinLogoSize" INTEGER DEFAULT 32,
    "mapTileStyle" TEXT DEFAULT 'light',
    "mapTileBrightness" INTEGER DEFAULT 100,
    "mapTileContrast" INTEGER DEFAULT 100,
    "mapTileSaturation" INTEGER DEFAULT 100,
    "mapTileHue" INTEGER DEFAULT 0,
    "mapTileGrayscale" INTEGER DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomePageContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectsPageContent" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "title" TEXT NOT NULL DEFAULT '┘àÏ┤ÏºÏ▒┘èÏ╣┘åÏº Ïº┘äÏ╣┘éÏºÏ▒┘èÏ®',
    "description" TEXT DEFAULT 'Ïº┘âÏ¬Ï┤┘ü ÏúÏ¡Ï»Ï½ ┘àÏ┤ÏºÏ▒┘èÏ╣ Ï┤Ï▒┘âÏ® ┘åÏ¡Ï¬ Ïº┘äÏúÏÁ┘ê┘ä Ïº┘äÏ╣┘éÏºÏ▒┘èÏ® ┘ü┘è ÏúÏ▒┘é┘ë ÏúÏ¡┘èÏºÏí Ïº┘ä┘à┘à┘ä┘âÏ®.',
    "emptyStateText" TEXT DEFAULT '┘äÏº Ï¬┘êÏ¼Ï» ┘àÏ┤ÏºÏ▒┘èÏ╣ Ï¡Ïº┘ä┘èÏº┘ï. ┘åÏ╣┘à┘ä Ï╣┘ä┘ë ÏÑÏÂÏº┘üÏ® ┘àÏ┤ÏºÏ▒┘èÏ╣ Ï¼Ï»┘èÏ»Ï® ┘éÏ▒┘èÏ¿Ïº┘ï.',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectsPageContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutPageContent" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "title" TEXT NOT NULL DEFAULT '┘à┘å ┘åÏ¡┘å',
    "shortDescription" TEXT,
    "fullDescription" TEXT,
    "vision" TEXT,
    "mission" TEXT,
    "values" TEXT,
    "mediaUrl" TEXT,
    "companyStats" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutPageContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "slug" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fullDescription" TEXT,
    "icon" TEXT,
    "image" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" TEXT NOT NULL,
    "category" TEXT,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceRequest" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "projectOrUnit" TEXT,
    "issueType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorApplication" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "vendorType" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "commercialRecord" TEXT,
    "city" TEXT,
    "companyProfile" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "experienceYears" INTEGER,
    "city" TEXT,
    "linkedInUrl" TEXT,
    "resumeUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactPageContent" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "title" TEXT NOT NULL DEFAULT 'Ï¬┘êÏºÏÁ┘ä ┘àÏ╣┘åÏº',
    "description" TEXT,
    "formTitle" TEXT NOT NULL DEFAULT 'ÏúÏ▒Ï│┘ä Ï▒Ï│Ïº┘äÏ¬┘â',
    "submitButtonText" TEXT NOT NULL DEFAULT 'ÏÑÏ▒Ï│Ïº┘ä Ïº┘äÏ▒Ï│Ïº┘äÏ®',
    "helperText" TEXT,
    "heroImage" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactPageContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SitePage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "showInNavbar" BOOLEAN NOT NULL DEFAULT false,
    "showInFooter" BOOLEAN NOT NULL DEFAULT false,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ctaLabel" TEXT,
    "ctaHref" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SitePage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NavigationItem" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "location" "NavigationLocation" NOT NULL DEFAULT 'HEADER',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "openInNewTab" BOOLEAN NOT NULL DEFAULT false,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NavigationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFlowSection" (
    "id" TEXT NOT NULL,
    "pageKey" TEXT NOT NULL DEFAULT 'home',
    "sectionKey" TEXT NOT NULL,
    "adminLabel" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "ctaLabel" TEXT,
    "ctaHref" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserFlowSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "managerId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorUserId" TEXT,
    "targetUserId" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "route" TEXT,
    "method" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assignedToId" TEXT,
    "relatedType" TEXT,
    "relatedId" TEXT,
    "priority" TEXT NOT NULL,
    "taskStatus" TEXT NOT NULL DEFAULT 'TODO',
    "approvalStatus" TEXT NOT NULL DEFAULT 'NOT_REQUIRED',
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "approvalRound" INTEGER NOT NULL DEFAULT 0,
    "dueDate" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskApproval" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "approvalRound" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedById" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approverId" TEXT,
    "decisionComment" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskComment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskWatcher" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskWatcher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskActivityLog" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "actorId" TEXT,
    "eventType" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignLink_shortCode_key" ON "CampaignLink"("shortCode");

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SitePage_slug_key" ON "SitePage"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "UserFlowSection_pageKey_sectionKey_key" ON "UserFlowSection"("pageKey", "sectionKey");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AppRole_name_key" ON "AppRole"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AppRole_code_key" ON "AppRole"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_code_key" ON "Permission"("code");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "AuditLog_targetUserId_idx" ON "AuditLog"("targetUserId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Task_taskStatus_idx" ON "Task"("taskStatus");

-- CreateIndex
CREATE INDEX "Task_approvalStatus_idx" ON "Task"("approvalStatus");

-- CreateIndex
CREATE INDEX "Task_assignedToId_idx" ON "Task"("assignedToId");

-- CreateIndex
CREATE INDEX "Task_dueDate_idx" ON "Task"("dueDate");

-- CreateIndex
CREATE INDEX "TaskApproval_status_idx" ON "TaskApproval"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TaskApproval_taskId_approvalRound_key" ON "TaskApproval"("taskId", "approvalRound");

-- CreateIndex
CREATE UNIQUE INDEX "TaskWatcher_taskId_userId_key" ON "TaskWatcher"("taskId", "userId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectFeature" ADD CONSTRAINT "ProjectFeature_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectWarranty" ADD CONSTRAINT "ProjectWarranty_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectGalleryImage" ADD CONSTRAINT "ProjectGalleryImage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectModel" ADD CONSTRAINT "ProjectModel_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "ProjectModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadNote" ADD CONSTRAINT "LeadNote_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadNote" ADD CONSTRAINT "LeadNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignLink" ADD CONSTRAINT "CampaignLink_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignLink" ADD CONSTRAINT "CampaignLink_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClickEvent" ADD CONSTRAINT "ClickEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClickEvent" ADD CONSTRAINT "ClickEvent_campaignLinkId_fkey" FOREIGN KEY ("campaignLinkId") REFERENCES "CampaignLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SitePage" ADD CONSTRAINT "SitePage_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "SitePage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NavigationItem" ADD CONSTRAINT "NavigationItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "NavigationItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "AppRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "AppRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskApproval" ADD CONSTRAINT "TaskApproval_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskApproval" ADD CONSTRAINT "TaskApproval_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskApproval" ADD CONSTRAINT "TaskApproval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskWatcher" ADD CONSTRAINT "TaskWatcher_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskWatcher" ADD CONSTRAINT "TaskWatcher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskActivityLog" ADD CONSTRAINT "TaskActivityLog_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskActivityLog" ADD CONSTRAINT "TaskActivityLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

