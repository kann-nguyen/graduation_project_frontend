import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import QueryBoundaries from "~/components/layout-components/QueryBoundaries";
import Sidebar from "~/components/layout-components/Sidebar";
import Topbar from "~/components/layout-components/Topbar";

export default function DashboardLayout() {
  return (
    <QueryBoundaries>
      <Box sx={{ display: 'flex', width: "100%", minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Topbar />
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            pt: { xs: 8, sm: 9 },
            px: { xs: 2, sm: 3, md: 4 }, // Add horizontal padding
            pb: { xs: 4, sm: 6 },
            width: '100%', // Ensure it takes up full width
            overflow: 'auto' // Changed from 'hidden' to 'auto' to allow scrolling if needed
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </QueryBoundaries>
  );
}
