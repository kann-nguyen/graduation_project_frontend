import { Assessment } from "@mui/icons-material";
import {
  Avatar,
  Card,
  CardContent,
  Stack,
  SxProps,
  Typography,
} from "@mui/material";
export default function TotalPhaseTemplates({
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
              Phase templates available
            </Typography>
            <Typography variant="h4">{total}</Typography>
          </Stack>
          <Avatar
            sx={{
              backgroundColor: "warning.main",
              height: 56,
              width: 56,
            }}
          >
            <Assessment />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}
