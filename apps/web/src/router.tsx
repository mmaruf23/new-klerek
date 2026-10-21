import { createBrowserRouter } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import SummaryPage from "@/pages/SummaryPage";
import DetailPage from "@/pages/DetailPage";
import LoginPage from "@/pages/auth/LoginPage";
import ProfilePage from "@/pages/admin/ProfilePage";
import DashboardPage from "@/pages/admin/DashboardPage";
import MembershipPage from "./pages/MembershipPage";
import ReferPage from "./pages/ReferPage";
import UsersPage from "./pages/admin/UsersPage";
import Layout from "./components/layout/Layout";
import ContactPage from "./pages/ContactPage";
import { redirectIfAuthenticatedMiddleware, requireAuthMiddleware, requireSuperadminMiddleware } from "@/libs/authGuard";
import { routes } from "./routes";
import AdminLayout from "./components/layout/AdminLayout";

export const router = createBrowserRouter([
  {
    path: routes.home,
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: routes.summary, element: <SummaryPage /> },
      { path: routes.detail, element: <DetailPage /> },
      { path: routes.membership, element: <MembershipPage /> },
      { path: routes.contact, element: <ContactPage /> },
      { path: routes.refer, element: <ReferPage /> },
    ],
  },
  {
    path: routes.home,
    element: <AdminLayout />,
    children: [
      { path: routes.dashboard, middleware: [requireAuthMiddleware], element: <DashboardPage /> },
      { path: routes.profile, middleware: [requireAuthMiddleware], element: <ProfilePage /> },
      { path: routes.adminUsers, middleware: [requireSuperadminMiddleware], element: <UsersPage /> },
    ],
  },
  {
    path: routes.home,
    middleware: [redirectIfAuthenticatedMiddleware],
    children: [{ path: routes.authLogin, element: <LoginPage /> }],
  },
]);
