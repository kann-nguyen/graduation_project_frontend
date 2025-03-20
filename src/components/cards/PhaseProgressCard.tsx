import { Schedule } from "@mui/icons-material";
import {
  Avatar,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  SxProps,
  Typography,
} from "@mui/material";
export default function PhaseProgressCard({
  sx,
  value,
}: {
  sx?: SxProps;
  value: number;
}) {
  return (
    <Card sx={sx}>
      <CardContent>
        <Stack
          alignItems="flex-start"
          direction="row"
          justifyContent="space-between"
        >
          <Stack spacing={1} sx={{ flexGrow: 0.8 }}>
            <Typography color="text.secondary" variant="overline">
              Progress
            </Typography>
            <LinearProgress variant="determinate" value={value} />
          </Stack>
          <Avatar
            sx={{
              backgroundColor: "info.main",
              height: 56,
              width: 56,
            }}
          >
            <Schedule />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}
