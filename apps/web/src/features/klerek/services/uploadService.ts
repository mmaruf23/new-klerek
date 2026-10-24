import { apiClient } from "@/lib/apiClient";
import type { Summary } from "../types/response";

export async function uploadPosFileApi(file: File): Promise<Summary> {
  const res = await apiClient.index.$post({
    form: {
      file,
    },
  });

  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.message ?? "Gagal memproses file.");
  }
  return json.data as unknown as Summary;
}

