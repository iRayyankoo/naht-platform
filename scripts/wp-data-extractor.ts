import fs from "fs";
import path from "path";
import crypto from "crypto";
import { prisma } from "../src/lib/prisma";

export interface WpAssetReference {
  wpProjectId: string;
  wpProjectTitle: string;
  relationType: "cover" | "gallery" | "brochure" | "plan";
  order: number;
}

export interface WpAssetManifestEntry {
  attachmentId: string;
  originalUrl: string;
  zipLocalPath: string;
  sha256: string;
  mimeType: string;
  isMissing: boolean;
  isDuplicate: boolean;
  references: WpAssetReference[];
}

export interface WpParsedFeature {
  title: string;
  desc?: string;
  icon?: string;
  order: number;
}

export interface WpParsedWarranty {
  title: string;
  desc?: string;
  duration?: string;
  order: number;
}

export interface WpProjectRecordAudit {
  wpId: string;
  title: string;
  rawSlug: string;
  decodedSlug: string;
  wpPostStatus: string;
  rawMetaStatus: string;
  convertedStatus: "AVAILABLE" | "SOLD" | "COMING_SOON" | "REVIEW_REQUIRED";
  city: string;
  district: string;
  type: string | null;
  shortDesc: string | null;
  fullDesc: string | null;
  mapLat: number | null;
  mapLng: number | null;
  rooms: number | null;
  price: number | null;
  area: number | null;
  areaFrom: string;
  areaTo: string;
  areaMin: string;
  areaMax: string;
  availableUnits: string;
  salesPercentage: string;
  pdfUrl: string | null;
  classification: "official" | "demo" | "uncertain";
  classificationReason: string;
  candidateType: "CREATE" | "UPDATE_MERGE" | "REVIEW_REQUIRED";
  matchedPrismaId?: string;
  matchedPrismaName?: string;
  matchedPrismaSlug?: string;
  semanticMatchReason?: string;
  missingRequiredFields: string[];
  unsupportedStatusValues: string[];
  unmappedFields: string[];
  deferredAmbiguousFields: { [key: string]: string };
  features: WpParsedFeature[];
  warranties: WpParsedWarranty[];
  assets: {
    coverId: string | null;
    galleryIds: string[];
    brochureIds: string[];
    planIds: string[];
  };
}

export function parseWpMetaAttachmentIds(val: string): string[] {
  if (!val || val === "a:0:{}") return [];
  const trimmed = val.trim();

  if (/^\d+$/.test(trimmed)) return [trimmed];

  const ids: string[] = [];
  const matches = trimmed.matchAll(/i:\d+;i:(\d+);|s:\d+:"(\d+)";|i:(\d+);/g);
  for (const m of matches) {
    const id = m[1] || m[2] || m[3];
    if (id && /^\d+$/.test(id) && !ids.includes(id)) {
      ids.push(id);
    }
  }
  if (ids.length > 0) return ids;

  if (trimmed.includes(",")) {
    return trimmed
      .split(",")
      .map((s) => s.trim())
      .filter((s) => /^\d+$/.test(s));
  }

  return [];
}

export function parseWpSerializedTextArray(val: string): { title: string; desc?: string; duration?: string; order: number }[] {
  if (!val || val === "a:0:{}") return [];
  const trimmed = val.trim();
  const results: { title: string; desc?: string; duration?: string; order: number }[] = [];

  if (!trimmed.startsWith("a:")) {
    const lines = trimmed.split("\n").map((s) => s.trim()).filter(Boolean);
    lines.forEach((line, idx) => {
      results.push({ title: line, order: idx });
    });
    return results;
  }

  // Extract s:4:"text";s:LEN:"VALUE"; or s:5:"title";s:LEN:"VALUE"; or s:4:"name";s:LEN:"VALUE";
  const fieldMatches = Array.from(trimmed.matchAll(/s:\d+:"(?:text|title|name|feature|guarantee)";s:\d+:"([\s\S]*?)";/g));
  if (fieldMatches.length > 0) {
    fieldMatches.forEach((m, idx) => {
      const txt = m[1].trim();
      if (txt) {
        results.push({ title: txt, order: idx });
      }
    });
    return results;
  }

  // Fallback: extract string values s:LEN:"VALUE"
  const stringMatches = Array.from(trimmed.matchAll(/s:\d+:"([\s\S]*?)";/g));
  let orderCounter = 0;
  for (const m of stringMatches) {
    const txt = m[1].trim();
    if (txt && !["text", "title", "name", "desc", "icon", "guarantee", "feature", "duration"].includes(txt)) {
      results.push({ title: txt, order: orderCounter++ });
    }
  }

  return results;
}

export async function runWpDataAudit(isDryRun: boolean = true) {
  if (!isDryRun) {
    throw new Error("CRITICAL ERROR: Only --dry-run mode is permitted in this phase!");
  }

  const xmlPath = "C:/tmp/naht-wordpress-source/naht-wordpress-all-content.xml";
  const zipPath = "C:/tmp/naht-wordpress-source/naht-wp-content-source-2026-08-12.zip";
  const uploadsBase = "C:/tmp/wp_extracted/wp_content/wp-content/uploads";

  if (!fs.existsSync(xmlPath)) {
    throw new Error(`XML source file not found at: ${xmlPath}`);
  }

  const xmlBuffer = fs.readFileSync(xmlPath);
  const xmlSha256 = crypto.createHash("sha256").update(xmlBuffer).digest("hex");

  let zipSha256 = "MISSING";
  if (fs.existsSync(zipPath)) {
    const zipBuffer = fs.readFileSync(zipPath);
    zipSha256 = crypto.createHash("sha256").update(zipBuffer).digest("hex");
  }

  const runId = `RUN_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const executionTime = new Date().toISOString();

  // Read existing Prisma projects live from DB (Read-Only)
  const existingPrismaProjects = await prisma.project.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      city: true,
      neighborhood: true,
    },
  });

  const xmlContent = xmlBuffer.toString("utf-8");

  const aliasMap: { [key: string]: { targetSlug: string; reason: string } } = {
    "نحت13": {
      targetSlug: "naht-13",
      reason: "Verified matching project number 13 between WP slug 'نحت13' and Prisma slug 'naht-13'",
    },
    "نحت14": {
      targetSlug: "naht-14",
      reason: "Verified matching project number 14 between WP slug 'نحت14' and Prisma slug 'naht-14'",
    },
    "نحت15": {
      targetSlug: "naht-15",
      reason: "Verified matching project number 15 between WP slug 'نحت15' and Prisma slug 'naht-15'",
    },
    "نحت23": {
      targetSlug: "naht-23",
      reason: "Verified matching project number 23 between WP slug 'نحت23' and Prisma slug 'naht-23'",
    },
    "نحت-30": {
      targetSlug: "naht-30",
      reason: "Verified matching project number 30 between WP slug 'نحت-30' and Prisma slug 'naht-30'",
    },
  };

  const extractNumber = (str: string): string | null => {
    const m = str.match(/\d+/);
    return m ? m[0] : null;
  };

  const allWpAttachments: { [id: string]: { id: string; parent: string; title: string; url: string } } = {};
  const attachmentByUrl: { [url: string]: string } = {};

  const attachmentRegex = /<item>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;

  while ((match = attachmentRegex.exec(xmlContent)) !== null) {
    const itemXml = match[1];
    const postTypeMatch = /<wp:post_type><!\[CDATA\[(.*?)\]\]><\/wp:post_type>|<wp:post_type>(.*?)<\/wp:post_type>/.exec(itemXml);
    const postType = postTypeMatch ? postTypeMatch[1] || postTypeMatch[2] : "";

    if (postType === "attachment") {
      const idMatch = /<wp:post_id>(\d+)<\/wp:post_id>/.exec(itemXml);
      const postId = idMatch ? idMatch[1] : "";

      const titleMatch = /<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title>([\s\S]*?)<\/title>/.exec(itemXml);
      const title = titleMatch ? (titleMatch[1] || titleMatch[2]).trim() : "";

      const parentMatch = /<wp:post_parent>(\d+)<\/wp:post_parent>/.exec(itemXml);
      const postParent = parentMatch ? parentMatch[1] : "0";

      const urlMatch = /<wp:attachment_url><!\[CDATA\[([\s\S]*?)\]\]><\/wp:attachment_url>|<wp:attachment_url>([\s\S]*?)<\/wp:attachment_url>/.exec(itemXml);
      const url = urlMatch ? (urlMatch[1] || urlMatch[2]).trim() : "";

      if (postId) {
        allWpAttachments[postId] = { id: postId, parent: postParent, title: title, url: url };
        if (url) attachmentByUrl[url] = postId;
      }
    }
  }

  const manifestMap: { [attId: string]: WpAssetManifestEntry } = {};

  const getOrCreateManifestEntry = (attId: string, fallbackUrl?: string): WpAssetManifestEntry => {
    if (manifestMap[attId]) return manifestMap[attId];

    const attObj = allWpAttachments[attId];
    const originalUrl = attObj?.url || fallbackUrl || "";

    let zipLocalPath = "";
    let sha256 = "";
    let isMissing = true;
    let mimeType = "image/jpeg";

    if (originalUrl.includes("/uploads/")) {
      const relPath = originalUrl.split("/uploads/")[1];
      zipLocalPath = path.join(uploadsBase, relPath.replace(/\//g, path.sep));
      if (fs.existsSync(zipLocalPath)) {
        isMissing = false;
        const fileBuffer = fs.readFileSync(zipLocalPath);
        sha256 = crypto.createHash("sha256").update(fileBuffer).digest("hex");

        const ext = path.extname(zipLocalPath).toLowerCase();
        if (ext === ".png") mimeType = "image/png";
        else if (ext === ".svg") mimeType = "image/svg+xml";
        else if (ext === ".pdf") mimeType = "application/pdf";
        else if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
      }
    }

    const entry: WpAssetManifestEntry = {
      attachmentId: attId,
      originalUrl: originalUrl,
      zipLocalPath: zipLocalPath,
      sha256: sha256,
      mimeType: mimeType,
      isMissing: isMissing,
      isDuplicate: false,
      references: [],
    };

    manifestMap[attId] = entry;
    return entry;
  };

  const unitRegex = /<item>([\s\S]*?)<\/item>/g;
  const projectAudits: WpProjectRecordAudit[] = [];

  const knownUnmappedFields = [
    "_puiux_maps_year",
    "_puiux_maps_budget",
    "_puiux_maps_executor",
    "_puiux_maps_duration",
    "_puiux_maps_sales_percentage",
    "_puiux_maps_available_units",
    "_puiux_maps_area_min",
    "_puiux_maps_area_max",
  ];

  const statusDistribution: { [key: string]: number } = {};

  while ((match = unitRegex.exec(xmlContent)) !== null) {
    const itemXml = match[1];
    const postTypeMatch = /<wp:post_type><!\[CDATA\[(.*?)\]\]><\/wp:post_type>|<wp:post_type>(.*?)<\/wp:post_type>/.exec(itemXml);
    const postType = postTypeMatch ? postTypeMatch[1] || postTypeMatch[2] : "";

    if (postType === "puiux_unit") {
      const idMatch = /<wp:post_id>(\d+)<\/wp:post_id>/.exec(itemXml);
      const postId = idMatch ? idMatch[1] : "";

      const titleMatch = /<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title>([\s\S]*?)<\/title>/.exec(itemXml);
      const title = titleMatch ? (titleMatch[1] || titleMatch[2]).trim() : "";

      const nameMatch = /<wp:post_name><!\[CDATA\[([\s\S]*?)\]\]><\/wp:post_name>|<wp:post_name>([\s\S]*?)<\/wp:post_name>/.exec(itemXml);
      const postName = nameMatch ? nameMatch[1] || nameMatch[2] : "";
      const decodedSlug = decodeURIComponent(postName);

      const statusMatch = /<wp:status><!\[CDATA\[(.*?)\]\]><\/wp:status>|<wp:status>(.*?)<\/wp:status>/.exec(itemXml);
      const wpStatus = statusMatch ? statusMatch[1] || statusMatch[2] : "";

      const metas: { [key: string]: string } = {};
      const metaRegex = /<wp:postmeta>[\s\S]*?<wp:meta_key><!\[CDATA\[([\s\S]*?)\]\]><\/wp:meta_key>[\s\S]*?<wp:meta_value><!\[CDATA\[([\s\S]*?)\]\]><\/wp:meta_value>[\s\S]*?<\/wp:postmeta>/g;
      let mMatch: RegExpExecArray | null;
      while ((mMatch = metaRegex.exec(itemXml)) !== null) {
        metas[mMatch[1]] = mMatch[2];
      }

      const thumbMatch = /<wp:meta_key><!\[CDATA\[_thumbnail_id\]\]><\/wp:meta_key>[\s\S]*?<wp:meta_value><!\[CDATA\[(\d+)\]\]><\/wp:meta_value>/.exec(itemXml);
      if (thumbMatch) metas["_thumbnail_id"] = thumbMatch[1];

      const contentMatch = /<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>|<content:encoded>([\s\S]*?)<\/content:encoded>/.exec(itemXml);
      const postContent = contentMatch ? (contentMatch[1] || contentMatch[2]).trim() : "";

      const wpDesc = (metas["_puiux_maps_description"] || "").trim();
      const shortDesc = wpDesc || (postContent ? postContent.substring(0, 150) : null);
      const fullDesc = postContent || wpDesc || null;

      const wpProjectType = (metas["_puiux_maps_project_type"] || metas["_puiux_maps_property_type"] || "").trim();
      const type = wpProjectType || null;

      const rawLat = parseFloat(metas["_puiux_maps_latitude"]);
      const rawLng = parseFloat(metas["_puiux_maps_longitude"]);
      const mapLat = !isNaN(rawLat) && rawLat !== 0 ? rawLat : null;
      const mapLng = !isNaN(rawLng) && rawLng !== 0 ? rawLng : null;

      const rawRooms = parseInt(metas["_puiux_maps_rooms"], 10);
      const rooms = !isNaN(rawRooms) && rawRooms > 0 ? rawRooms : null;

      // Price & Area (Nullable if empty/missing, DO NOT force 0 if missing)
      const rawPriceStr = metas["_puiux_maps_price"];
      let price: number | null = null;
      if (rawPriceStr && rawPriceStr.trim() !== "") {
        const pNum = parseFloat(rawPriceStr);
        if (!isNaN(pNum)) price = pNum;
      }

      const rawAreaStr = metas["_puiux_maps_area_from"] || metas["_puiux_maps_area"];
      let area: number | null = null;
      if (rawAreaStr && rawAreaStr.trim() !== "") {
        const aNum = parseFloat(rawAreaStr);
        if (!isNaN(aNum)) area = aNum;
      }

      // PDF Brochure
      let pdfUrl: string | null = null;
      if (metas["_puiux_maps_project_file"]) {
        const pf = metas["_puiux_maps_project_file"].trim();
        if (pf.startsWith("http")) pdfUrl = pf;
        else if (allWpAttachments[pf]?.url) pdfUrl = allWpAttachments[pf].url;
      }

      // Unserialize PHP Array for Features & Warranties
      const features: WpParsedFeature[] = parseWpSerializedTextArray(metas["_puiux_maps_features"] || "");
      const warranties: WpParsedWarranty[] = parseWpSerializedTextArray(metas["_puiux_maps_guarantees"] || "");

      // Status
      const rawMetaStatus = metas["_puiux_maps_status"] || wpStatus;
      statusDistribution[rawMetaStatus] = (statusDistribution[rawMetaStatus] || 0) + 1;

      let convertedStatus: WpProjectRecordAudit["convertedStatus"] = "AVAILABLE";
      const unsupportedStatusValues: string[] = [];

      if (rawMetaStatus === "available") {
        convertedStatus = "AVAILABLE";
      } else if (rawMetaStatus === "sold") {
        convertedStatus = "SOLD";
      } else if (rawMetaStatus === "soon") {
        convertedStatus = "COMING_SOON";
      } else if (rawMetaStatus === "under-sale") {
        convertedStatus = "REVIEW_REQUIRED";
        unsupportedStatusValues.push("under-sale");
      } else {
        convertedStatus = "REVIEW_REQUIRED";
        unsupportedStatusValues.push(rawMetaStatus);
      }

      let classification: "official" | "demo" | "uncertain" = "official";
      let classificationReason = "Official Naht real estate project in WordPress source.";

      if (title.includes("ديمو") || title.includes("مخطط نحت السكني") || decodedSlug.includes("demo")) {
        classification = "demo";
        classificationReason = "Contains explicit demo/test markers in WordPress title or slug.";
      }

      const missingRequiredFields: string[] = [];
      if (!title) missingRequiredFields.push("title");
      if (!metas["_puiux_maps_city"] || metas["_puiux_maps_city"].trim() === "") missingRequiredFields.push("city");
      if (!metas["_puiux_maps_district"] || metas["_puiux_maps_district"].trim() === "") missingRequiredFields.push("district");

      let matchedPrisma: (typeof existingPrismaProjects)[0] | undefined = undefined;
      let semanticMatchReason: string | undefined = undefined;

      matchedPrisma = existingPrismaProjects.find(
        (p) => p.slug === postName || p.slug === decodedSlug
      );
      if (matchedPrisma) {
        semanticMatchReason = `Exact slug match on '${matchedPrisma.slug}'`;
      }

      if (!matchedPrisma && aliasMap[decodedSlug]) {
        const aliasEntry = aliasMap[decodedSlug];
        matchedPrisma = existingPrismaProjects.find((p) => p.slug === aliasEntry.targetSlug);
        if (matchedPrisma) {
          semanticMatchReason = aliasEntry.reason;
        }
      }

      if (!matchedPrisma) {
        const wpNum = extractNumber(title) || extractNumber(decodedSlug);
        if (wpNum) {
          matchedPrisma = existingPrismaProjects.find((p) => {
            const pNum = extractNumber(p.name) || extractNumber(p.slug);
            return pNum === wpNum && (p.name.includes("نحت") || p.slug.includes("naht"));
          });
          if (matchedPrisma) {
            semanticMatchReason = `Project number match: '${wpNum}' in WP '${title}' matches Prisma '${matchedPrisma.name}' (${matchedPrisma.slug})`;
          }
        }
      }

      let candidateType: WpProjectRecordAudit["candidateType"] = "CREATE";

      if (classification === "official") {
        if (matchedPrisma) {
          candidateType = "UPDATE_MERGE";
        } else {
          candidateType = "CREATE";
        }
      } else {
        candidateType = "REVIEW_REQUIRED";
      }

      const deferredAmbiguousFields: { [key: string]: string } = {
        building: metas["_puiux_maps_building"] || "",
        unit_number: metas["_puiux_maps_unit_number"] || "",
        floor: metas["_puiux_maps_floor"] || "",
      };

      let coverId: string | null = null;
      const galleryIds: string[] = [];
      const brochureIds: string[] = [];
      const planIds: string[] = [];

      if (metas["_thumbnail_id"]) {
        const ids = parseWpMetaAttachmentIds(metas["_thumbnail_id"]);
        if (ids.length > 0) {
          coverId = ids[0];
          const entry = getOrCreateManifestEntry(ids[0]);
          entry.references.push({
            wpProjectId: postId,
            wpProjectTitle: title,
            relationType: "cover",
            order: 0,
          });
        }
      }

      if (metas["_puiux_maps_gallery"]) {
        const ids = parseWpMetaAttachmentIds(metas["_puiux_maps_gallery"]);
        ids.forEach((id, orderIdx) => {
          if (!galleryIds.includes(id)) galleryIds.push(id);
          const entry = getOrCreateManifestEntry(id);
          entry.references.push({
            wpProjectId: postId,
            wpProjectTitle: title,
            relationType: "gallery",
            order: orderIdx,
          });
        });
      }

      if (metas["_puiux_maps_project_file"]) {
        const pf = metas["_puiux_maps_project_file"].trim();
        const ids = parseWpMetaAttachmentIds(pf);
        if (ids.length > 0) {
          ids.forEach((id, orderIdx) => {
            if (!brochureIds.includes(id)) brochureIds.push(id);
            const entry = getOrCreateManifestEntry(id);
            entry.references.push({
              wpProjectId: postId,
              wpProjectTitle: title,
              relationType: "brochure",
              order: orderIdx,
            });
          });
        } else if (attachmentByUrl[pf]) {
          const id = attachmentByUrl[pf];
          if (!brochureIds.includes(id)) brochureIds.push(id);
          const entry = getOrCreateManifestEntry(id, pf);
          entry.references.push({
            wpProjectId: postId,
            wpProjectTitle: title,
            relationType: "brochure",
            order: 0,
          });
        }
      }

      projectAudits.push({
        wpId: postId,
        title: title,
        rawSlug: postName,
        decodedSlug: decodedSlug,
        wpPostStatus: wpStatus,
        rawMetaStatus: rawMetaStatus,
        convertedStatus: convertedStatus,
        city: metas["_puiux_maps_city"]?.trim() || "الرياض",
        district: metas["_puiux_maps_district"]?.trim() || "غير محدد",
        type: type,
        shortDesc: shortDesc,
        fullDesc: fullDesc,
        mapLat: mapLat,
        mapLng: mapLng,
        rooms: rooms,
        price: price,
        area: area,
        areaFrom: metas["_puiux_maps_area_from"] || "",
        areaTo: metas["_puiux_maps_area_to"] || "",
        areaMin: metas["_puiux_maps_area_min"] || "",
        areaMax: metas["_puiux_maps_area_max"] || "",
        availableUnits: metas["_puiux_maps_available_units"] || "",
        salesPercentage: metas["_puiux_maps_sales_percentage"] || "",
        pdfUrl: pdfUrl,
        classification: classification,
        classificationReason: classificationReason,
        candidateType: candidateType,
        matchedPrismaId: matchedPrisma?.id,
        matchedPrismaName: matchedPrisma?.name,
        matchedPrismaSlug: matchedPrisma?.slug,
        semanticMatchReason: semanticMatchReason,
        missingRequiredFields: missingRequiredFields,
        unsupportedStatusValues: unsupportedStatusValues,
        unmappedFields: knownUnmappedFields,
        deferredAmbiguousFields: deferredAmbiguousFields,
        features: features,
        warranties: warranties,
        assets: {
          coverId: coverId,
          galleryIds: galleryIds,
          brochureIds: brochureIds,
          planIds: planIds,
        },
      });
    }
  }

  const manifestList = Object.values(manifestMap);
  const sha256Seen = new Set<string>();
  let duplicateBlobCount = 0;

  manifestList.forEach((entry) => {
    if (entry.sha256) {
      if (sha256Seen.has(entry.sha256)) {
        entry.isDuplicate = true;
        duplicateBlobCount++;
      } else {
        sha256Seen.add(entry.sha256);
      }
    }
  });

  let referenceEdgeCount = 0;
  let coverReferenceEdges = 0;
  let galleryReferenceEdges = 0;
  let brochureReferenceEdges = 0;
  let planReferenceEdges = 0;

  manifestList.forEach((entry) => {
    referenceEdgeCount += entry.references.length;
    entry.references.forEach((r) => {
      if (r.relationType === "cover") coverReferenceEdges++;
      else if (r.relationType === "gallery") galleryReferenceEdges++;
      else if (r.relationType === "brochure") brochureReferenceEdges++;
      else if (r.relationType === "plan") planReferenceEdges++;
    });
  });

  // Calculate Total Features and Warranties across all XML records
  let totalSourceFeaturesCount = 0;
  let totalSourceWarrantiesCount = 0;
  projectAudits.forEach((r) => {
    totalSourceFeaturesCount += r.features.length;
    totalSourceWarrantiesCount += r.warranties.length;
  });

  const uniqueAttachmentIds = manifestList.length;
  const uniqueBlobHashes = sha256Seen.size;
  const missingAttachmentCount = manifestList.filter((a) => a.isMissing).length;

  const totalWpRecords = projectAudits.length;
  const officialRecords = projectAudits.filter((r) => r.classification === "official").length;
  const demoRecords = projectAudits.filter((r) => r.classification === "demo").length;
  const uncertainRecords = projectAudits.filter((r) => r.classification === "uncertain").length;

  const createCandidates = projectAudits.filter((r) => r.candidateType === "CREATE").length;
  const updateMergeCandidates = projectAudits.filter((r) => r.candidateType === "UPDATE_MERGE").length;
  const reviewRequiredCandidates = projectAudits.filter((r) => r.candidateType === "REVIEW_REQUIRED").length;

  const recordsWithMissingRequired = projectAudits.filter((r) => r.missingRequiredFields.length > 0).length;

  const summary = {
    runId: runId,
    executionTime: executionTime,
    xmlSha256: xmlSha256,
    zipSha256: zipSha256,
    isDryRun: isDryRun,
    totalWpRecords: totalWpRecords,
    officialRecords: officialRecords,
    demoRecords: demoRecords,
    uncertainRecords: uncertainRecords,
    createCandidates: createCandidates,
    updateMergeCandidates: updateMergeCandidates,
    reviewRequiredCandidates: reviewRequiredCandidates,
    recordsWithMissingRequiredFieldsCount: recordsWithMissingRequired,
    statusDistribution: statusDistribution,
    referencedFilesStats: {
      referenceEdgeCount: referenceEdgeCount,
      coverReferenceEdges: coverReferenceEdges,
      galleryReferenceEdges: galleryReferenceEdges,
      brochureReferenceEdges: brochureReferenceEdges,
      planReferenceEdges: planReferenceEdges,
      uniqueAttachmentIds: uniqueAttachmentIds,
      uniqueBlobHashes: uniqueBlobHashes,
      duplicateBlobCount: duplicateBlobCount,
      missingAttachmentCount: missingAttachmentCount,
      totalSourceFeaturesCount: totalSourceFeaturesCount,
      totalSourceWarrantiesCount: totalSourceWarrantiesCount,
    },
    specificProjectCheck: {
      "بتيل فيلا": {
        featuresCount: projectAudits.find((r) => r.decodedSlug === "بتيل-فيلا")?.features.length || 0,
        warrantiesCount: projectAudits.find((r) => r.decodedSlug === "بتيل-فيلا")?.warranties.length || 0,
      },
      "نحت 15": {
        featuresCount: projectAudits.find((r) => r.decodedSlug === "نحت15")?.features.length || 0,
        warrantiesCount: projectAudits.find((r) => r.decodedSlug === "نحت15")?.warranties.length || 0,
      },
      "نحت 16": {
        featuresCount: projectAudits.find((r) => r.decodedSlug === "نحت-16")?.features.length || 0,
        warrantiesCount: projectAudits.find((r) => r.decodedSlug === "نحت-16")?.warranties.length || 0,
      },
    },
    unmappedFieldsList: knownUnmappedFields,
  };

  const artifactsDir = "C:/tmp/wp_audit_outputs";
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(artifactsDir, "project-migration-plan.json"),
    JSON.stringify({ metadata: { runId, executionTime, xmlSha256, zipSha256 }, summary, records: projectAudits }, null, 2),
    "utf-8"
  );

  const collisionCsvHeader = `runId,executionTime,xmlSha256,zipSha256,WP_ID,WP_Title,WP_Slug,WP_Status,Candidate_Type,Prisma_Matched_ID,Prisma_Matched_Name,Prisma_Matched_Slug,Semantic_Match_Reason,Missing_Required_Fields\n`;
  const collisionCsvRows = projectAudits
    .map((r) =>
      [
        runId,
        executionTime,
        xmlSha256,
        zipSha256,
        r.wpId,
        `"${r.title.replace(/"/g, '""')}"`,
        `"${r.decodedSlug}"`,
        r.wpPostStatus,
        r.candidateType,
        r.matchedPrismaId || "N/A",
        `"${(r.matchedPrismaName || "N/A").replace(/"/g, '""')}"`,
        r.matchedPrismaSlug || "N/A",
        `"${(r.semanticMatchReason || "None").replace(/"/g, '""')}"`,
        `"${r.missingRequiredFields.join("; ")}"`,
      ].join(",")
    )
    .join("\n");
  fs.writeFileSync(path.join(artifactsDir, "project-collision-matrix.csv"), collisionCsvHeader + collisionCsvRows, "utf-8");

  fs.writeFileSync(
    path.join(artifactsDir, "project-assets-manifest.json"),
    JSON.stringify({ metadata: { runId, executionTime, xmlSha256, zipSha256 }, manifest: manifestList }, null, 2),
    "utf-8"
  );

  const missingCsvHeader = "runId,executionTime,xmlSha256,zipSha256,Attachment_ID,Original_URL,MIME_Type,Referenced_Projects\n";
  const missingCsvRows = manifestList
    .filter((a) => a.isMissing)
    .map((a) => [runId, executionTime, xmlSha256, zipSha256, a.attachmentId, `"${a.originalUrl}"`, a.mimeType, `"${a.references.map((r) => r.wpProjectTitle).join("; ")}"`].join(","))
    .join("\n");
  fs.writeFileSync(path.join(artifactsDir, "missing-assets.csv"), missingCsvHeader + missingCsvRows, "utf-8");

  return { summary, records: projectAudits, manifest: manifestList };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const isApply = args.includes("--apply");
  const isDryRun = !isApply || args.includes("--dry-run");

  // Environment Guard: Ensure execution ONLY on local database
  const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/naht_wp_import_disposable_test";
  if (!dbUrl.includes("127.0.0.1") && !dbUrl.includes("localhost")) {
    console.error("ENVIRONMENT GUARD VIOLATION: Execution is strictly FORBIDDEN on non-local / production databases!");
    process.exit(1);
  }

  console.log("=================================================");
  console.log(`  WORDPRESS DATA EXTRACTOR & IMPORTER (${isApply ? "APPLY MODE" : "DRY-RUN MODE"})`);
  console.log("=================================================");
  console.log("Target Asset Directory: public/uploads/projects/official/");
  console.log("Environment Host: 127.0.0.1 (Local Only)");
  console.log(`Execution Mode: ${isApply ? "APPLY (Idempotent DB Update)" : "DRY-RUN (Safe Read-Only Preview)"}\n`);

  runWpDataAudit(isDryRun)
    .then((result) => {
      console.log(JSON.stringify(result.summary, null, 2));
      console.log("\nReviewable artifacts saved to: C:/tmp/wp_audit_outputs/");
      console.log("- project-migration-plan.json");
      console.log("- project-collision-matrix.csv");
      console.log("- project-assets-manifest.json");
      console.log("- missing-assets.csv");
    })
    .catch((err: unknown) => {
      console.error("Audit Execution Failed:", err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
