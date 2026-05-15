import { createBrowserRouter, redirect, type LoaderFunctionArgs } from "react-router-dom";
import type { Summary } from "@packages/contract";
import HomePage from "@/pages/HomePage";
import SummaryPage from "@/pages/SummaryPage";
import DetailPage from "@/pages/DetailPage";
import LoginPage from "@/pages/auth/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import { redirectIfAuthenticatedMiddleware, requireAuthMiddleware } from "@/lib/authGuard";
import MembershipPage from "./pages/MembershipPage";
import Layout from "./components/layout/Layout";
import ContactPage from "./pages/ContactPage";
import { fetchStores } from "./services/adminApi";

function summaryLoader(): Summary {
  const raw = sessionStorage.getItem("klerek_summary");
  if (!raw) throw redirect("/");
  return JSON.parse(raw) as Summary;
}

function storeLoader({ request }: LoaderFunctionArgs) {
  return fetchStores(request);
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "/summary", loader: summaryLoader, element: <SummaryPage /> },
      { path: "/detail", loader: summaryLoader, element: <DetailPage /> },
      { path: "/membership", element: <MembershipPage /> },
      { path: "/contact", element: <ContactPage /> },
    ],
  },
  { path: "/auth/login", middleware: [redirectIfAuthenticatedMiddleware], element: <LoginPage /> },
  { path: "/stores", middleware: [requireAuthMiddleware], loader: storeLoader, element: <DashboardPage /> },
]);

export const routes = router.routes;
