import { useMutation } from "@tanstack/react-query";
import type { Summary } from "@packages/contract";
import { uploadPosFileApi } from "../components/services/uploadService";

export function useUploadMutation() {
  return useMutation<Summary, Error, File>({
    mutationFn: (file: File) => uploadPosFileApi(file),
  });
}

