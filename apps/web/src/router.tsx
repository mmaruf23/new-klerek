import { createBrowserRouter, redirect, type LoaderFunctionArgs } from "react-router-dom";
import type { Summary } from "@packages/contract";
import HomePage from "@/pages/HomePage";
import SummaryPage from "@/pages/SummaryPage";
import DetailPage from "@/pages/DetailPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ProfilePage from "@/pages/ProfilePage";
import DashboardPage from "@/pages/DashboardPage";
import MembershipPage from "./pages/MembershipPage";
import ReferPage from "./pages/ReferPage";
import Layout from "./components/layout/Layout";
import ContactPage from "./pages/ContactPage";
import { redirectIfAuthenticatedMiddleware, requireAuthMiddleware } from "@/lib/authGuard";
import { fetchStores } from "./services/adminApi";
import { fetchProfile } from "./services/authApi";
import { config } from "./config";
import { routes } from "./routes";
import AdminLayout from "./components/layout/AdminLayout";

function summaryLoader(): Summary {
  const raw = sessionStorage.getItem("klerek_summary");
  if (!raw) throw redirect(routes.home);
  return JSON.parse(raw) as Summary;
}

function storeLoader({ request }: LoaderFunctionArgs) {
  return fetchStores(request);
}

function profileLoader() {
  const token = sessionStorage.getItem(config.ACCESS_TOKEN_KEY);
  if (!token) throw redirect(routes.authLogin);
  return fetchProfile(token);
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
      { path: routes.refer, element: <ReferPage /> },
    ],
  },
  {
    path: routes.home,
    element: <AdminLayout />,
    children: [
      { path: routes.dashboard, middleware: [requireAuthMiddleware], loader: storeLoader, element: <DashboardPage /> },
      { path: routes.profile, middleware: [requireAuthMiddleware], loader: profileLoader, element: <ProfilePage /> },
    ],
  },
  {
    path: routes.home,
    middleware: [redirectIfAuthenticatedMiddleware],
    children: [
      { path: routes.authLogin, element: <LoginPage /> },
      { path: routes.authRegister, element: <RegisterPage /> },
    ],
  },
]);
