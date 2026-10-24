// Proprietary - Student Project Tracker FYP - Unauthorized copying prohibited
import localforage from "localforage";
import { getSupabaseClient } from "./supabaseClient.js";

const cache = localforage.createInstance({ name: "project-portal" });
const bucketName = import.meta.env.VITE_STORAGE_BUCKET || "fyp-docs";
const browserKeys = {
  "student-session": "student_user",
  "supervisor-session": "supervisor_user"
};

export async function getCached(key) {
  const browserKey = browserKeys[key];
  if (browserKey) {
    const stored = localStorage.getItem(browserKey);
    if (stored) return JSON.parse(stored);
  }

  const cached = await cache.getItem(key);
  if (cached && browserKey) localStorage.setItem(browserKey, JSON.stringify(cached));
  return cached;
}

export async function setCached(key, value) {
  const browserKey = browserKeys[key];
  if (browserKey) localStorage.setItem(browserKey, JSON.stringify(value));
  await cache.setItem(key, value);
  return value;
}

export async function removeCached(key) {
  const browserKey = browserKeys[key];
  if (browserKey) localStorage.removeItem(browserKey);
  await cache.removeItem(key);
}

export async function uploadFile(file, folder) {
  if (!(file instanceof File)) throw new Error("Choose a file to upload.");

  const safeName = file.name.replace(/[^\w.-]+/g, "_");
  const path = `${folder}/${crypto.randomUUID()}-${safeName}`;
  const { data, error } = await getSupabaseClient()
    .storage.from(bucketName)
    .upload(path, file, { contentType: file.type || "application/octet-stream" });
  if (error) throw error;

  const { data: publicFile } = getSupabaseClient()
    .storage.from(bucketName)
    .getPublicUrl(data.path);
  return { path: data.path, url: publicFile.publicUrl };
}
