import localforage from "localforage";
import { getSupabaseClient } from "./supabaseClient.js";

const cache = localforage.createInstance({ name: "project-portal" });
const bucketName = import.meta.env.VITE_STORAGE_BUCKET || "fyp-docs";

export function getCached(key) {
  return cache.getItem(key);
}

export function setCached(key, value) {
  return cache.setItem(key, value);
}

export function removeCached(key) {
  return cache.removeItem(key);
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
