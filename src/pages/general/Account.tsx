import {
  Box,
  Container,
  Grid,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import AccountProfile from "~/components/cards/AccountProfileCard";
import AccountProfileDetails from "~/components/cards/AccountProfileDetailsCard";
import Integration from "~/components/cards/IntegrationCard";
import { useAccountContext } from "~/hooks/general";

export default function Account() {
  const account = useAccountContext();
  return (
    <Box
      sx={{
        flexGrow: 1,
        height: "100vh",
        overflow: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Toolbar />
      <Container maxWidth="xl" sx={{ my: 4 }}>
        <Stack spacing={5}>
          <div>
            <Typography variant="h4">Account</Typography>
          </div>
          <div>
            <Grid container spacing={3} alignItems="center">
              <Grid xs={12} md={6} lg={4}>
                <AccountProfile account={account} />
              </Grid>
              <Grid xs={12} md={6} lg={8}>
                <Stack spacing={2} sx={{ p: 2 }}>
                  <AccountProfileDetails />
                  <Integration />
                </Stack>
              </Grid>
            </Grid>
          </div>
        </Stack>
      </Container>
    </Box>
  );
}
