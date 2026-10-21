import { useMutation, useQuery } from "@tanstack/react-query";
import type { GeneratePaymentInput } from "@packages/contract";
import { generateQrisApi, checkPaymentApi } from "../services/paymentService";

export function useGenerateQrisMutation() {
  return useMutation({
    mutationFn: (input: GeneratePaymentInput) => generateQrisApi(input),
  });
}

export function usePaymentStatusQuery(invoiceId: string, enabled = false) {
  return useQuery({
    queryKey: ["payment", "status", invoiceId],
    queryFn: () => checkPaymentApi(invoiceId),
    enabled: Boolean(invoiceId) && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "pending" ? 3000 : false;
    },
  });
}

