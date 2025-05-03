import { Box, Container, Grid, Toolbar } from "@mui/material";
import PhaseTemplateMgmtCard from "~/components/cards/PhaseTemplateMgmtCard";

export default function AdminTemplatePage() {
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
            <PhaseTemplateMgmtCard />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
