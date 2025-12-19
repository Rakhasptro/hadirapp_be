import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(imagePath: string): string {
  if (!imagePath) return '';
  
  // If already full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Get API URL from env
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  
  // Extract base URL properly
  // Example: https://api.giyuu.online/api -> https://api.giyuu.online
  let baseUrl: string;
  try {
    const url = new URL(apiUrl);
    // Remove /api path if present
    const pathname = url.pathname.replace('/api', '');
    baseUrl = `${url.protocol}//${url.host}${pathname}`;
  } catch {
    // Fallback for invalid URLs
    baseUrl = apiUrl.replace(/\/api\/?$/, '');
  }
  
  // Ensure imagePath starts with /
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  return `${baseUrl}${path}`;
}
