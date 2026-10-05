/**
 * Replaces dynamic variables in templates like {{user_name}} or {{invoice_amount}}
 * with support for fallbacks: {{user_name | "Valued Customer"}}
 */
export function compileTemplate(
  content: string,
  variables: Record<string, any> = {}
): string {
  if (!content) return "";

  return content.replace(/\{\{\s*([a-zA-Z0-9_-]+)(?:\s*\|\s*["']([^"']*)["'])?\s*\}\}/g, (match, key, fallback) => {
    if (variables[key] !== undefined && variables[key] !== null) {
      return String(variables[key]);
    }
    if (fallback !== undefined) {
      return fallback;
    }
    return match; // Keep as is if no variable or fallback
  });
}

/**
 * Extracts all unique {{variable}} tags from a template
 */
export function extractTemplateVariables(content: string): string[] {
  if (!content) return [];
  const matches = content.matchAll(/\{\{\s*([a-zA-Z0-9_-]+)/g);
  const vars = new Set<string>();
  for (const match of matches) {
    if (match[1]) vars.add(match[1]);
  }
  return Array.from(vars);
}
