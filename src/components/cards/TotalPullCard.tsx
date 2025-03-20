import { Commit } from "@mui/icons-material";
import {
  Avatar,
  Card,
  CardContent,
  Stack,
  SxProps,
  Typography,
} from "@mui/material";
import { PullRequest } from "~/icons/Icons";
export default function TotalCommits({
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
              Total pull requests
            </Typography>
            <Typography variant="h4">{total}</Typography>
          </Stack>
          <Avatar
            sx={{
              backgroundColor: "success.main",
              height: 56,
              width: 56,
            }}
          >
            <PullRequest />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}
