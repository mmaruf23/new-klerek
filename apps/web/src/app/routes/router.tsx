import {
  createRouter,
  createRootRoute,
  createRoute,
  Outlet,
} from "@tanstack/react-router";
import HomePage from "@/pages/HomePage";
import SummaryPage from "@/pages/SummaryPage";
import DetailPage from "@/pages/DetailPage";
import LoginPage from "@/pages/auth/LoginPage";
import ProfilePage from "@/pages/admin/ProfilePage";
import DashboardPage from "@/pages/admin/DashboardPage";
import MembershipPage from "@/pages/MembershipPage";
import ReferPage from "@/pages/ReferPage";
import UsersPage from "@/pages/admin/UsersPage";
import ContactPage from "@/pages/ContactPage";
import Layout from "@/components/layout/Layout";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  requireAuthGuard,
  requireSuperadminGuard,
  redirectIfAuthenticatedGuard,
} from "@/lib/authGuard";

// Root Route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Layout Public
const publicLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "publicLayout",
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/",
  component: HomePage,
});

const summaryRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/summary",
  component: SummaryPage,
});

const detailRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/detail",
  component: DetailPage,
});

const membershipRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/membership",
  component: MembershipPage,
});

const contactRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/contact",
  component: ContactPage,
});

const referRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/refer",
  component: ReferPage,
});

// Layout Admin (Protected)
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "adminLayout",
  component: AdminLayout,
  beforeLoad: async () => {
    await requireAuthGuard();
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const profileRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/profile",
  component: ProfilePage,
});

const adminUsersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/users",
  beforeLoad: async () => {
    await requireSuperadminGuard();
  },
  component: UsersPage,
});

// Auth Route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/login",
  beforeLoad: async () => {
    await redirectIfAuthenticatedGuard();
  },
  component: LoginPage,
});

// Route Tree
const routeTree = rootRoute.addChildren([
  publicLayoutRoute.addChildren([
    indexRoute,
    summaryRoute,
    detailRoute,
    membershipRoute,
    contactRoute,
    referRoute,
  ]),
  adminLayoutRoute.addChildren([
    dashboardRoute,
    profileRoute,
    adminUsersRoute,
  ]),
  loginRoute,
]);

export const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
