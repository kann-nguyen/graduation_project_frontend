import { Box, CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { SnackbarProvider, useSnackbar } from "notistack";
import { Suspense, lazy, useEffect } from "react";
import {
  Navigate,
  RouteObject,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import FullScreenLoading from "~/components/layout-components/FullScreenLoading";
import {
  IErrorResponse,
  ISuccessResponse,
} from "~/hooks/fetching/response-type";
import { getAccountInfo } from "~/hooks/fetching/account/axios";
import { updateAccountContext } from "~/hooks/general";
import { createComponents } from "~/theme/create-components";
import { createPalette } from "~/theme/create-palette";
import { createShadows } from "~/theme/create-shadows";
import { createTypography } from "~/theme/create-typography";
import NotFound from "./general/404";
const Script = lazy(() => import("./member/Script"));
const AdminAccountPage = lazy(() => import("./admin/AdminAccountPage"));
const AdminTemplatePage = lazy(() => import("./admin/AdminTemplatePage"));
const AdminToolPage = lazy(() => import("./admin/AdminToolPage"));
const FirstTimeLoginPage = lazy(() => import("./member/FirstTimeLoginPage"));
const ProjectPage = lazy(() => import("./member/ProjectPage"));
const ProjectsPage = lazy(() => import("./member/ProjectsPage"));
const Task = lazy(() => import("./member/Task"));
const DashboardLayout = lazy(() => import("~/components/layout-components/DashboardLayout"));
const AccountInfo = lazy(() => import("./general/Account"));
const AdminPage = lazy(() => import("./admin/AdminHomePage"));
const Home = lazy(() => import("./general/Home"));
const Login = lazy(() => import("./general/Login"));
const MemberDetailInfo = lazy(() => import("../components/cards/MemberDetail"));
const PhaseDetailInfo = lazy(() => import("./member/PhaseDetail"));
const PhaseInfo = lazy(() => import("./member/Phase"));
const SignUpPage = lazy(() => import("./general/SignUp"));
const TicketDetailPage = lazy(() => import("./member/TicketDetail"));
const TicketPage = lazy(() => import("./member/Ticket"));
const VulnerabilityPage = lazy(() => import("./member/Vulnerability"));
const ArtifactDetailPage = lazy(() => import("./member/ArtifactDetail"));
const ThreatDetailPage = lazy(() => import("./member/ThreatDetail"));
const MembersPage = lazy(() => import("./member/MembersPage"));
const ThreatsPage = lazy(() => import("./member/ThreatsPage"));
const WorkflowAnalytics = lazy(() => import("./member/WorkflowAnalytics"));

function GlobalSuspense({ element }: { element: JSX.Element }) {
  return <Suspense fallback={<FullScreenLoading />}>{element}</Suspense>;
}
const managerAndMemberRoutes: RouteObject = {
  path: "/:currentProject",
  element: <GlobalSuspense element={<DashboardLayout />} />,
  children: [
    {
      path: "",
      element: <GlobalSuspense element={<Home />} />,
    },
    {
      path: "vulnerabilities",
      element: <GlobalSuspense element={<VulnerabilityPage />} />,
    },    {
      path: "threats",
      element: <GlobalSuspense element={<ThreatsPage />} />,
    },
    {
      path: "workflow",
      element: <GlobalSuspense element={<WorkflowAnalytics />} />,
    },
    {
      path: "phases",
      children: [
        {
          path: "",
          element: <GlobalSuspense element={<PhaseInfo />} />,
        },
        {
          path: ":phaseId",
          element: <GlobalSuspense element={<PhaseDetailInfo />} />,
        },
      ],
    },
    {
      path: "tickets",
      children: [
        {
          path: "",
          element: <GlobalSuspense element={<TicketPage />} />,
        },
        {
          path: ":ticketId",
          element: <GlobalSuspense element={<TicketDetailPage />} />,
        },
      ],
    },
    {
      path: "members",
      element: <GlobalSuspense element={<MembersPage />} />,
    },
    {
      path: "projects",
      element: <GlobalSuspense element={<ProjectsPage />} />,
    },
    {
      path: "project",
      element: <GlobalSuspense element={<ProjectPage />} />,
    },
    {
      path: "memberInfo",
      children: [
        {
          path: ":memberId",
          element: <GlobalSuspense element={<MemberDetailInfo />} />,
        },
      ],
    },
    {
      path: "tasks",
      element: <GlobalSuspense element={<Task />} />,
    },
    {
      path: "scripts",
      element: <GlobalSuspense element={<Script />} />,
    },
    {
      path: "artifact/:artifactId",
      element: <GlobalSuspense element={<ArtifactDetailPage />} />,
    },
    {
      path: "threats/:threatId",
      element: <GlobalSuspense element={<ThreatDetailPage />} />,
    },
  ],
};
const adminRoutes: RouteObject = {
  path: "/admin",
  element: <GlobalSuspense element={<DashboardLayout />} />,
  children: [
    {
      path: "home",
      element: <GlobalSuspense element={<AdminPage />} />,
    },
    {
      path: "projects",
      element: <GlobalSuspense element={<ProjectsPage />} />,
    },
    {
      path: "accounts",
      element: <GlobalSuspense element={<AdminAccountPage />} />,
    },
    {
      path: "templates",
      element: <GlobalSuspense element={<AdminTemplatePage />} />,
    },
    {
      path: "tools",
      element: <GlobalSuspense element={<AdminToolPage />} />,
    },
  ],
};
const router = createBrowserRouter([
  adminRoutes,
  managerAndMemberRoutes,
  {
    path: "/signup",
    element: <GlobalSuspense element={<SignUpPage />} />,
  },
  {
    path: "/login",
    element: <GlobalSuspense element={<Login />} />,
  },
  {
    path: "/user/:username",
    element: <GlobalSuspense element={<DashboardLayout />} />,
    children: [
      {
        path: "",
        element: <GlobalSuspense element={<AccountInfo />} />,
      },
    ],
  },
  {
    path: "/new-project",
    element: <GlobalSuspense element={<DashboardLayout />} />,
    children: [
      {
        path: "",
        element: <GlobalSuspense element={<FirstTimeLoginPage />} />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
  {
    path: "/",
    element: <Navigate to="/login" />,
  },
]);
export default function App() {
  const palette = createPalette();
  const components = createComponents({ palette });
  const shadows = createShadows();
  const typography = createTypography();
  const theme = createTheme({
    typography,
    components,
    palette,
    shadows,
    shape: {
      borderRadius: 8,
    },
  });
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
    queryCache: new QueryCache({
      onSuccess: (data) => {
        const dataResponse = data as ISuccessResponse<any> | IErrorResponse;
        if (dataResponse.status === "error") {
          enqueueSnackbar(dataResponse.message, { variant: "error" });
        }
      },
    }),
  });

  // Initialize auth state from session
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await getAccountInfo();
        if (data) {
          await updateAccountContext();
        }
      } catch (error) {
        console.error('Failed to initialize auth state:', error);
      }
    };
    initAuth();
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider autoHideDuration={4000} maxSnack={1}>
          <ThemeProvider theme={theme}>
            <Box display="flex">
              <CssBaseline />
              <RouterProvider router={router} />
            </Box>
          </ThemeProvider>
        </SnackbarProvider>
      </QueryClientProvider>
    </LocalizationProvider>
  );
}
