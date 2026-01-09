export function sanitizeLabel(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  let sanitized = input.length > 1000 ? input.substring(0, 1000) : input;
  sanitized = sanitized.replaceAll(/<[^>]{0,500}>/g, "");
  sanitized = sanitized.replaceAll(/[;'"\\]/g, "");
  sanitized = sanitized.trim().substring(0, 100);

  return sanitized;
}

export function sanitizeAmount(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  const sanitized = input.replaceAll(/[^0-9.]/g, "");
  const parts = sanitized.split(".");
  if (parts.length > 2) {
    return parts[0] + "." + parts.slice(1).join("");
  }
  if (parts.length === 2 && parts[1].length > 2) {
    return parts[0] + "." + parts[1].substring(0, 2);
  }

  return sanitized;
}
export function sanitizeText(input: string, maxLength: number = 500): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  let sanitized =
    input.length > maxLength * 2 ? input.substring(0, maxLength * 2) : input;
  sanitized = sanitized.replaceAll(/<[^>]{0,500}>/g, "");
  return sanitized.trim().substring(0, maxLength);
}
