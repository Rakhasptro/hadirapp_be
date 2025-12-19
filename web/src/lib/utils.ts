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
  
  // Get base URL from env, default to localhost
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const baseUrl = apiUrl.replace('/api', '');
  
  // Ensure imagePath starts with /
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  return `${baseUrl}${path}`;
}
