import { ArrowLeft } from "@mui/icons-material";
import { Box, Button, Container, Link, Typography } from "@mui/material";
import Error404 from "/error-404.png";
export default function NotFound() {
  return (
    <Box
      component="main"
      sx={{
        alignItems: "center",
        display: "flex",
        flexGrow: 1,
        height: "100vh",
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              mb: 3,
              textAlign: "center",
            }}
          >
            <img
              alt="Under development"
              src={Error404}
              style={{
                display: "inline-block",
                maxWidth: "100%",
                width: 400,
              }}
            />
          </Box>
          <Typography align="center" sx={{ mb: 3 }} variant="h3">
            404: The page you are looking for isn’t here
          </Typography>
          <Typography align="center" color="text.secondary" variant="body1">
            You either tried some shady route or you came here by mistake.
            Whichever it is, try using the navigation
          </Typography>
          <Button
            component={Link}
            href="/login"
            startIcon={<ArrowLeft fontSize="small" />}
            sx={{ mt: 3 }}
            variant="contained"
          >
            Go back to login page
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
