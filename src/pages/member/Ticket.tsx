import { Box, Container, Paper, Typography, Toolbar, alpha } from "@mui/material";
import { useParams } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { BugReport } from "@mui/icons-material";
import ExtendedTicketTable from "~/components/styled-components/TicketTable";
import { useTicketsQuery } from "~/hooks/fetching/ticket/query";

// Component chính cho trang quản lý tickets
export default function Ticket() {
  const { currentProject } = useParams();
  const theme = useTheme();
  // Query để lấy danh sách tickets
  const ticketQuery = useTicketsQuery(currentProject);
  const tickets = ticketQuery.data?.data ?? [];

  // Hiển thị loading khi đang tải dữ liệu
  if (ticketQuery.isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="calc(100vh - 64px)">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      flexGrow: 1, 
      minHeight: "100vh", 
      width: "100%", 
      overflow: "auto",
      bgcolor: theme.palette.mode === 'dark' ? 'background.default' : alpha(theme.palette.primary.light, 0.04),
    }}>
      <Toolbar />
      <Container sx={{ py: 3 }} maxWidth="xl">
        {/* Header trang - Box mô tả */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 2, 
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Icon trang trí nền */}
          <Box 
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: { xs: 80, md: 150 },
              height: '100%',
              opacity: 0.05,
              display: { xs: 'none', md: 'block' }
            }}
          >
            <BugReport sx={{ fontSize: 180, position: 'absolute', top: '50%', right: -20, transform: 'translateY(-50%)' }} />
          </Box>
          
          {/* Nội dung header */}
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h4" fontWeight="bold">
              Project Tickets
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
              Track and manage project tickets for {currentProject || "this project"}
            </Typography>
          </Box>
        </Paper>

        {/* Bảng tickets với layout mới */}
        <ExtendedTicketTable tickets={tickets} />
      </Container>
    </Box>
  );
}
