import { AccountCircle } from "@mui/icons-material";
import {
  Avatar,
  Card,
  CardContent,
  Stack,
  SxProps,
  Typography,
} from "@mui/material";

export default function TotalActiveUsers({
  sx,
  total,
}: {
  sx?: SxProps;
  total: number;
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
              Active users
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
            <AccountCircle />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}
