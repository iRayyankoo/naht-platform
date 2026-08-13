/**
 * Shared Contact Helper Utilities for Public Real Estate Site
 */

export function isValidPhone(phone?: string | null): boolean {
  if (!phone) return false;
  const trimmed = phone.trim();
  if (trimmed.length < 7) return false;
  if (
    trimmed.includes("00000000") ||
    trimmed.includes("12345678") ||
    trimmed.includes("920000000") ||
    trimmed.includes("920012345") ||
    trimmed.includes("placeholder") ||
    trimmed.includes("test")
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
    trimmed.includes("example.com") ||
    trimmed.includes("test.com") ||
    trimmed.includes("placeholder") ||
    trimmed.includes("none@")
  ) {
    return false;
  }
  return true;
}

export function isValidWhatsapp(whatsapp?: string | null): boolean {
  if (!whatsapp) return false;
  const trimmed = whatsapp.trim();
  if (!trimmed) return false;

  let rawNumber = trimmed;
  if (trimmed.startsWith("https://wa.me/")) {
    const after = trimmed.replace("https://wa.me/", "").split("?")[0].split("/")[0];
    rawNumber = after;
  } else if (trimmed.startsWith("https://api.whatsapp.com/")) {
    const match = trimmed.match(/phone=([0-9+]+)/);
    if (match && match[1]) {
      rawNumber = match[1];
    } else {
      return false;
    }
  }

  const digits = rawNumber.replace(/\D/g, "");
  if (!digits || digits.length < 9 || digits.length > 15) return false;
  if (digits.startsWith("9200") || digits.startsWith("920")) return false;
  if (
    digits.includes("000000") ||
    digits.includes("123456") ||
    digits.includes("999999") ||
    digits === "123456789"
  ) {
    return false;
  }

  if (digits.startsWith("9665") || digits.startsWith("05") || digits.startsWith("5")) {
    return true;
  }
  return digits.length >= 10;
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
