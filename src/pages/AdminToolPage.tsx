import { Box, Container, Grid, Toolbar } from "@mui/material";
import ScanningToolManagementCard from "~/components/cards/ScanningToolManagementCard";

export default function AdminToolPage() {
  return (
    <Box 
      sx={{ 
        flexGrow: 1, 
        height: "100vh", 
        width: "100%", 
        overflow: "auto",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <Toolbar />
      <Container 
        sx={{ 
          my: 4, 
          width: '100%', 
          maxWidth: '100% !important',
          px: { xs: 2, sm: 3, md: 4 }
        }} 
        maxWidth={false}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ScanningToolManagementCard />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
