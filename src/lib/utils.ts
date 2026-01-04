import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { api } from "../context/AuthContext";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Normalize server-returned asset paths (images, uploads) into absolute URLs.
// Prefer axios instance baseURL if set, otherwise fall back to REACT_APP_API_URL.
export function normalizeAssetUrl(url?: string | null) {
    if (!url) return url || '';
    if (typeof url !== 'string') return String(url);
    // already absolute - return as-is (e.g., S3 URLs)
    if (/^https?:\/\//i.test(url)) {
        console.log('normalizeAssetUrl: URL is already absolute, returning as-is:', url);
        return url;
    }
    let path = url;
    if (!path.startsWith('/')) path = '/' + path;
    const envBase = process.env.REACT_APP_API_URL || '';
    const axiosBase = (api && api.defaults && api.defaults.baseURL) ? (api.defaults.baseURL as string) : '';
    const base = axiosBase || envBase || '';
    let baseForAssets = base;
    if (/\/api\/?$/i.test(base)) {
        if (/^\/api\//i.test(path) || /^\/uploads\//i.test(path)) {
            baseForAssets = base.replace(/\/api\/?$/i, '');
        }
    }
    const result = `${baseForAssets.replace(/\/$/, '')}${path}`;
    console.log('normalizeAssetUrl: converted relative URL:', url, '→', result);
    return result;
}
