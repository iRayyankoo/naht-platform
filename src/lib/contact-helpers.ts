/**
 * Shared Contact Helper Utilities for Public Real Estate Site
 */

export function isValidPhone(phone?: string | null): boolean {
  if (!phone) return false;
  const trimmed = phone.trim();
  if (trimmed.length < 7) return false;
  if (
    trimmed.includes("00000000") ||
    trimmed.includes("12345") ||
    trimmed.includes("920000000") ||
    trimmed.includes("920012345") ||
    trimmed.includes("9200")
  ) {
    return false;
  }
  return true;
}

export function isValidEmail(email?: string | null): boolean {
  if (!email) return false;
  const trimmed = email.trim().toLowerCase();
  if (trimmed.length < 5 || !trimmed.includes("@")) return false;
  if (
    trimmed.includes("info@naht-re.sa") ||
    trimmed.includes("info@naht.com.sa") ||
    trimmed.includes("info@naht") ||
    trimmed.includes("example.com") ||
    trimmed.includes("test.com") ||
    trimmed.includes("placeholder")
  ) {
    return false;
  }
  return true;
}

export function isValidWhatsapp(whatsapp?: string | null): boolean {
  return isValidPhone(whatsapp);
}

export function formatProjectName(name?: string | null): string {
  if (!name) return "";
  const trimmed = name.trim();
  if (trimmed.startsWith("مشروع ")) {
    return trimmed;
  }
  return `مشروع ${trimmed}`;
}

export function formatUnitType(type?: string | null): string {
  if (!type || type === "???" || type.includes("?")) return "وحدة عقارية";
  return type;
}

export function formatFloor(floor?: string | null): string | null {
  if (!floor) return null;
  const lower = floor.toLowerCase().trim();
  if (lower.startsWith("floor ")) {
    return lower.replace("floor ", "الطابق ");
  }
  return floor;
}
