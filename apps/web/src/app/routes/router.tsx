import {
  createRouter,
  createRootRoute,
  createRoute,
  Outlet,
} from "@tanstack/react-router";
import HomePage from "@/features/home/components/HomePage";
import SummaryPage from "@/features/klerek/components/SummaryPage";
import DetailPage from "@/features/klerek/components/DetailPage";
import LoginPage from "@/features/auth/components/LoginPage";
import ProfilePage from "@/features/profile/components/ProfilePage";
import DashboardPage from "@/features/dashboard/components/DashboardPage";
import MembershipPage from "@/features/payment/components/MembershipPage";
import ReferPage from "@/features/referral/components/ReferPage";
import UsersPage from "@/features/dashboard/components/UsersPage";
import ContactPage from "@/features/contact/components/ContactPage";
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
