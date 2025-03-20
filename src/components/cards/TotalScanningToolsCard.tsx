import { Build, Commit } from "@mui/icons-material";
import {
  Avatar,
  Card,
  CardContent,
  Stack,
  SxProps,
  Typography,
} from "@mui/material";
import { PullRequest } from "~/icons/Icons";
export default function TotalScanningTools({
  total,
  sx,
}: {
  total: number;
  sx?: SxProps;
}) {
  return (
    <Card sx={sx}>
      <CardContent>
        <Stack
          alignItems="flex-start"
          direction="row"
          justifyContent="space-between"
          spacing={3}
        >
          <Stack spacing={1}>
            <Typography color="text.secondary" variant="overline">
              Scanning tools available
            </Typography>
            <Typography variant="h4">{total}</Typography>
          </Stack>
          <Avatar
            sx={{
              backgroundColor: "info.main",
              height: 56,
              width: 56,
            }}
          >
            <Build />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}
