export function getLogoUrl(rawUrl) {
  if (!rawUrl) return null;

  const logoUrl = rawUrl.trim();
  if (!logoUrl) return null;

  if (logoUrl.startsWith("http://") || logoUrl.startsWith("https://")) {
    return logoUrl;
  }

  if (logoUrl.startsWith("/uploads/")) {
    const rawBackendUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (!rawBackendUrl) {
      console.warn(
        "[logo:getLogoUrl] NEXT_PUBLIC_API_URL is not defined. Logos stored under /uploads/ cannot be shown."
      );
      return logoUrl;
    }

    const backendUrl = rawBackendUrl.endsWith("/")
      ? rawBackendUrl.slice(0, -1)
      : rawBackendUrl;

    const cleanPath = logoUrl.startsWith("/") ? logoUrl : `/${logoUrl}`;
    return `${backendUrl}${cleanPath}`;
  }

  return logoUrl;
}


