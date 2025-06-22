/**
 * Utility functions for working with images
 */

/**
 * Get the base backend URL without /api suffix
 */
function getBackendBaseUrl(): string {
  // First try to get backend URL from env
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (backendUrl) {
    return backendUrl;
  }
  
  // Fallback: derive from API URL by removing /api suffix
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  return apiUrl.replace(/\/api$/, '');
}

/**
 * Convert relative image path to full URL
 * @param imagePath - Relative path like "/uploads/images/file.jpg" or full URL
 * @returns Full URL to the image
 */
export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) {
    return '/images/placeholder.png'; // Default placeholder
  }

  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If relative path, prepend backend URL
  const backendUrl = getBackendBaseUrl();
  return `${backendUrl}${imagePath}`;
}

/**
 * Check if image URL is valid
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    // If not a full URL, check if it's a valid relative path
    return url.startsWith('/') && url.length > 1;
  }
}