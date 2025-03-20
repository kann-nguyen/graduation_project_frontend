import { Replay } from "@mui/icons-material";
import { Box, Button, Container, Typography } from "@mui/material";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ReactNode } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import Error404 from "/error-404.png";

export default function QueryBoundaries({ children }: { children: ReactNode }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} FallbackComponent={ErrorView}>
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

function ErrorView({ error, resetErrorBoundary }: FallbackProps) {
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
            {error.message}
          </Typography>
          <Button
            startIcon={<Replay fontSize="small" />}
            sx={{ mt: 3 }}
            variant="contained"
            onClick={resetErrorBoundary}
          >
            Retry
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
