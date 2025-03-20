import { Assignment } from "@mui/icons-material";
import {
  Avatar,
  Card,
  CardContent,
  Stack,
  SxProps,
  Typography,
} from "@mui/material";

export default function ActiveTaskCount({
  count,
  sx,
}: {
  count: number;
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
              Active tasks
            </Typography>
            <Typography variant="h4">{count}</Typography>
          </Stack>
          <Avatar
            sx={{
              backgroundColor: "info.main",
              height: 56,
              width: 56,
            }}
          >
            <Assignment />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}
