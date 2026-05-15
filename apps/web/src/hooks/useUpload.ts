import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadFile } from "@/services/uploadApi";
import { routes } from "@/routes";

const RECENT_KEY = "klerek_recent_uploads";

export interface RecentUpload {
  name: string;
  storeName: string;
  branchId: string;
  timestamp: string;
}

function saveRecent(file: File, storeName: string, branchId: string) {
  try {
    const prev: RecentUpload[] = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    const entry: RecentUpload = {
      name: file.name,
      storeName,
      branchId,
      timestamp: new Date().toISOString(),
    };
    const next = [entry, ...prev.filter((r) => r.name !== file.name)].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch (error) {
    console.log(error);
  }
}

export function getRecentUploads(): RecentUpload[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function useUpload() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const summary = await uploadFile(file);
      sessionStorage.setItem("klerek_summary", JSON.stringify(summary));
      sessionStorage.setItem("klerek_upload_filename", file.name);
      saveRecent(file, summary.store_name, summary.branch_id);
      navigate(routes.summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return { upload, loading, error };
}
