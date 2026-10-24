import { useMutation } from "@tanstack/react-query";
import { uploadPosFileApi } from "../services/uploadService";

export function useUploadMutation() {
  return useMutation({
    mutationFn: (file: File) => uploadPosFileApi(file),
  });
}

