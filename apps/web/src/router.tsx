import { createBrowserRouter, redirect } from "react-router-dom";
import type { Summary } from "@packages/contract";
import HomePage from "@/pages/HomePage";
import SummaryPage from "@/pages/SummaryPage";
import DetailPage from "@/pages/DetailPage";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminStorePage, { loader as adminStoreLoader } from "@/pages/admin/AdminStorePage";
import { redirectIfAdmin } from "@/lib/authGuard";
import MembershipPage from "./pages/MembershipPage";
import Layout from "./components/layout/Layout";
import ContactPage from "./pages/ContactPage";

function summaryLoader(): Summary {
  const raw = sessionStorage.getItem("klerek_summary");
  if (!raw) throw redirect("/");
  return JSON.parse(raw) as Summary;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "/summary",
        loader: summaryLoader,
        element: <SummaryPage />,
      },
      {
        path: "/detail",
        loader: summaryLoader,
        element: <DetailPage />,
      },
      {
        path: "/membership",
        // loader: summaryLoader,
        element: <MembershipPage />,
      },
      {
        path: "/contact",
        // loader: summaryLoader,
        element: <ContactPage />,
      },
    ],
  },
  {
    path: "/admin/login",
    loader: () => {
      redirectIfAdmin();
      return null;
    },
    element: <AdminLoginPage />,
  },
  {
    path: "/admin/stores",
    loader: adminStoreLoader,
    element: <AdminStorePage />,
  },
]);

export const routes = router.routes;
