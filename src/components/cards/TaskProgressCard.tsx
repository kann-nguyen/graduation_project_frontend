import { ChecklistRtl } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  SxProps,
  Typography,
} from "@mui/material";

export default function TaskProgressCard({
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
              Completion progress
            </Typography>
            <Typography variant="h4">{`${value}%`}</Typography>
          </Stack>
          <Avatar
            sx={{
              backgroundColor: value === 100 ? "success.main" : "warning.main",
              height: 56,
              width: 56,
            }}
          >
            <ChecklistRtl />
          </Avatar>
        </Stack>
        <Box sx={{ mt: 3 }}>
          <LinearProgress value={value} variant="determinate" />
        </Box>
      </CardContent>
    </Card>
  );
}
