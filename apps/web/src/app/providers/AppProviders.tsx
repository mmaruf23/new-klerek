import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { queryClient } from "@/lib/queryClient";
import { config } from "@/config";

export interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={config.GOOGLE_CLIENT_ID || ""}>
        {children}
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
}

