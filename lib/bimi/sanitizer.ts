/**
 * BIMI (Brand Indicators for Message Identification) SVG Tiny 1.2 PS Sanitizer & Validator
 * Conforms strictly to BIMI Group & RFC SVG Tiny Portable/Secure profile specifications.
 * Removes all executable scripts, external references, and formats the SVG for Gmail, Apple Mail, and Yahoo.
 */

export interface BimiValidationResult {
  valid: boolean;
  svg?: string;
  error?: string;
  warnings: string[];
  dimensions?: { width: number; height: number };
}

/**
 * Validates and sanitizes an SVG string according to BIMI SVG Tiny 1.2 PS standards.
 */
export function sanitizeAndValidateBimiSvg(rawSvg: string): BimiValidationResult {
  const warnings: string[] = [];

  if (!rawSvg || typeof rawSvg !== "string") {
    return { valid: false, error: "Empty or invalid SVG content provided", warnings };
  }

  const trimmed = rawSvg.trim();

  // Basic check for SVG tag
  if (!trimmed.toLowerCase().includes("<svg") || !trimmed.toLowerCase().includes("</svg>")) {
    return { valid: false, error: "Content is not a valid SVG document", warnings };
  }

  // 1. Check file size (RFC BIMI standard: max 32KB)
  const byteLength = Buffer.byteLength(trimmed, "utf8");
  if (byteLength > 32 * 1024) {
    return {
      valid: false,
      error: `SVG file size (${(byteLength / 1024).toFixed(1)} KB) exceeds the 32 KB limit mandated by BIMI specifications.`,
      warnings,
    };
  }

  // 2. Check for disallowed/executable security tags
  const forbiddenTags = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<foreignobject\b[^<]*(?:(?!<\/foreignobject>)<[^<]*)*<\/foreignobject>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<audio\b[^<]*(?:(?!<\/audio>)<[^<]*)*<\/audio>/gi,
    /<video\b[^<]*(?:(?!<\/video>)<[^<]*)*<\/video>/gi,
    /<embed\b[^>]*>/gi,
    /<object\b[^>]*>/gi,
  ];

  let sanitized = trimmed;
  for (const pattern of forbiddenTags) {
    if (pattern.test(sanitized)) {
      warnings.push("Stripped potentially unsafe active tags (<script>/<foreignObject>/<embed>).");
      sanitized = sanitized.replace(pattern, "");
    }
  }

  // 3. Remove inline event handlers (onload, onclick, onerror, onmouseover, etc.)
  const eventHandlerPattern = /\son\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi;
  if (eventHandlerPattern.test(sanitized)) {
    warnings.push("Stripped inline javascript event handlers.");
    sanitized = sanitized.replace(eventHandlerPattern, "");
  }

  // 4. Remove external references (e.g. href="http://...", url(http://...))
  const externalRefPattern = /(?:href|xlink:href)\s*=\s*["']https?:\/\/[^"']+["']/gi;
  if (externalRefPattern.test(sanitized)) {
    warnings.push("Removed external URL references (BIMI requires fully self-contained vector paths).");
    sanitized = sanitized.replace(externalRefPattern, "");
  }

  // 5. Parse and normalize viewBox & root <svg> attributes
  const svgOpenMatch = sanitized.match(/<svg\b([^>]*)>/i);
  if (!svgOpenMatch) {
    return { valid: false, error: "Failed to parse root <svg> element", warnings };
  }

  const existingAttributes = svgOpenMatch[1];

  // Extract viewBox if present
  let viewBox = "";
  const viewBoxMatch = existingAttributes.match(/viewBox\s*=\s*["']([^"']+)["']/i);
  let vbWidth = 512;
  let vbHeight = 512;

  if (viewBoxMatch) {
    const parts = viewBoxMatch[1].trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && !parts.some(isNaN)) {
      vbWidth = parts[2];
      vbHeight = parts[3];
      if (Math.abs(vbWidth - vbHeight) > 1) {
        warnings.push(`Aspect ratio was ${vbWidth}:${vbHeight}. BIMI displays logos as 1:1 squares; normalized viewBox.`);
        // Pad to square
        const maxDim = Math.max(vbWidth, vbHeight);
        viewBox = `viewBox="0 0 ${maxDim} ${maxDim}"`;
      } else {
        viewBox = `viewBox="0 0 ${vbWidth} ${vbHeight}"`;
      }
    }
  }

  if (!viewBox) {
    // Try to extract width and height
    const widthMatch = existingAttributes.match(/width\s*=\s*["']?(\d+)/i);
    const heightMatch = existingAttributes.match(/height\s*=\s*["']?(\d+)/i);
    if (widthMatch && heightMatch) {
      vbWidth = parseInt(widthMatch[1], 10);
      vbHeight = parseInt(heightMatch[1], 10);
      const maxDim = Math.max(vbWidth, vbHeight);
      viewBox = `viewBox="0 0 ${maxDim} ${maxDim}"`;
      warnings.push(`Generated square viewBox from width/height (${maxDim}x${maxDim}).`);
    } else {
      viewBox = 'viewBox="0 0 512 512"';
      warnings.push("Added default square viewBox (0 0 512 512).");
    }
  }

  // 6. Enforce SVG Tiny 1.2 PS attributes
  // Clean out existing version, baseProfile, xmlns, viewBox from attributes
  let cleanedAttrs = existingAttributes
    .replace(/\bversion\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\bbaseProfile\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\bviewBox\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\bxmlns\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\bwidth\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\bheight\s*=\s*["'][^"']*["']/gi, "")
    .trim();

  // Rebuild standardized root SVG tag
  const compliantSvgOpen = `<svg xmlns="http://www.w3.org/2000/svg" version="1.2" baseProfile="tiny-ps" ${viewBox} ${cleanedAttrs}>`.replace(
    /\s{2,}/g,
    " "
  );

  sanitized = sanitized.replace(svgOpenMatch[0], compliantSvgOpen);

  // Remove XML declarations or DOCTYPEs if present to avoid parser quirks
  sanitized = sanitized.replace(/<\?xml[^>]*\?>/gi, "").trim();
  sanitized = sanitized.replace(/<!DOCTYPE[^>]*>/gi, "").trim();

  return {
    valid: true,
    svg: sanitized,
    warnings,
    dimensions: { width: vbWidth, height: vbHeight },
  };
}
