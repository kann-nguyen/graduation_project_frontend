import { Box, Container, Grid, Toolbar } from "@mui/material";
import AccountMgmtCard from "~/components/cards/AccountMgmtCard";

export default function AdminAccountPage() {
  return (
    <Box 
      component="main"
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
        maxWidth={false}
        sx={{ 
          my: 4, 
          width: '100%',
          flex: 1
        }}
      >
        <Grid container spacing={2} sx={{ width: '100%' }}>
          <Grid item xs={12}>
            <AccountMgmtCard />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
