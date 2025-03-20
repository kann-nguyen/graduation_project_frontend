import { Box, Container, Toolbar, Typography } from "@mui/material";

export default function FirstTimeLoginPage() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100%",
      }}
    >
      <Toolbar />
      <Container sx={{ my: 4 }} maxWidth="xl">
        <Typography variant="h4" align="center">
          Import your projects from Gitlab or Github using the project selection
          on the topbar. If you are a member, ask your manager to add you to any
          project to start.
        </Typography>
      </Container>
    </Box>
  );
}
