import { createBrowserRouter, redirect, type LoaderFunctionArgs } from "react-router-dom";
import type { Summary } from "@packages/contract";
import HomePage from "@/pages/HomePage";
import SummaryPage from "@/pages/SummaryPage";
import DetailPage from "@/pages/DetailPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import MembershipPage from "./pages/MembershipPage";
import Layout from "./components/layout/Layout";
import ContactPage from "./pages/ContactPage";
import { redirectIfAuthenticatedMiddleware, requireAuthMiddleware } from "@/lib/authGuard";
import { fetchStores } from "./services/adminApi";

export const routes = {
  home: "/",
  summary: "/summary",
  detail: "/detail",
  membership: "/membership",
  contact: "/contact",
  authLogin: "/auth/login",
  authRegister: "/auth/register",
  stores: "/stores",
} as const;

function summaryLoader(): Summary {
  const raw = sessionStorage.getItem("klerek_summary");
  if (!raw) throw redirect(routes.home);
  return JSON.parse(raw) as Summary;
}

function storeLoader({ request }: LoaderFunctionArgs) {
  return fetchStores(request);
}

export const router = createBrowserRouter([
  {
    path: routes.home,
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: routes.summary, loader: summaryLoader, element: <SummaryPage /> },
      { path: routes.detail, loader: summaryLoader, element: <DetailPage /> },
      { path: routes.membership, element: <MembershipPage /> },
      { path: routes.contact, element: <ContactPage /> },
    ],
  },
  { path: routes.authLogin, middleware: [redirectIfAuthenticatedMiddleware], element: <LoginPage /> },
  { path: routes.authRegister, element: <RegisterPage /> },
  { path: routes.stores, middleware: [requireAuthMiddleware], loader: storeLoader, element: <DashboardPage /> },
]);
