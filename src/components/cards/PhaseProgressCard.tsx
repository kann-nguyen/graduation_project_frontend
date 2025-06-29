// Import các component từ Material-UI và icon
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

/**
 * Component hiển thị card tiến độ của phase
 * @param sx - Styling tùy chỉnh cho component
 * @param value - Giá trị phần trăm tiến độ (0-100)
 */
export default function PhaseProgressCard({
  sx,
  value,
}: {
  sx?: SxProps;
  value: number;
}) {
  return (
    // Card container chính để hiển thị thông tin tiến độ
    <Card sx={sx}>
      <CardContent>
        {/* Stack chính chứa nội dung và icon, sắp xếp theo hàng ngang */}
        <Stack
          alignItems="flex-start"
          direction="row"
          justifyContent="space-between"
        >
          {/* Stack con chứa label và thanh tiến độ */}
          <Stack spacing={1} sx={{ flexGrow: 0.8 }}>
            {/* Label hiển thị "Progress" */}
            <Typography color="text.secondary" variant="overline">
              Progress
            </Typography>
            {/* Thanh tiến độ hiển thị giá trị phần trăm */}
            <LinearProgress variant="determinate" value={value} />
          </Stack>
          {/* Avatar hiển thị icon lịch trình ở góc phải */}
          <Avatar
            sx={{
              backgroundColor: "info.main", // Màu nền xanh dương
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
