import { useNavigate } from "@tanstack/react-router";
import { useUploadMutation } from "@/features/klerek/hooks/useUploadPos";

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
    console.error(error);
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
  const mutation = useUploadMutation();

  const upload = (file: File) => {
    mutation.mutate(file, {
      onSuccess: (summary) => {
        sessionStorage.setItem("klerek_summary", JSON.stringify(summary));
        sessionStorage.setItem("klerek_upload_filename", file.name);
        saveRecent(file, summary.store_name, summary.branch_id);
        navigate({ to: "/summary" });
      },
    });
  };

  return {
    upload,
    loading: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
}
