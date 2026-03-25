import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useRouterState,
} from "@tanstack/react-router";
import Layout from "./components/Layout";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import DashboardPage from "./pages/Dashboard";
import HealthPage from "./pages/Health";
import HistoryPage from "./pages/History";
import InvitePage from "./pages/Invite";
import InviteRedeemPage from "./pages/InviteRedeem";
import LoginPage from "./pages/Login";
import WorkoutsPage from "./pages/Workouts";

const queryClient = new QueryClient();

const PUBLIC_PATHS = ["/invite/"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

function AppShell() {
  const { identity, isInitializing } = useInternetIdentity();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  // Public routes (invite redeem) bypass auth
  if (isPublicPath(pathname)) {
    return <Outlet />;
  }

  if (isInitializing) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, #0f3a8a 0%, #1E73E8 60%, #5ba3f5 100%)",
        }}
      >
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold">Loading GymTrack...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

const rootRoute = createRootRoute({ component: AppShell });

const inviteRedeemRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/invite/$code",
  component: InviteRedeemPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});
const workoutsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/workouts",
  component: WorkoutsPage,
});
const healthRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/health",
  component: HealthPage,
});
const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/history",
  component: HistoryPage,
});
const inviteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/invite",
  component: InvitePage,
});

const routeTree = rootRoute.addChildren([
  inviteRedeemRoute,
  dashboardRoute,
  workoutsRoute,
  healthRoute,
  historyRoute,
  inviteRoute,
]);
const router = createRouter({ routeTree });

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
