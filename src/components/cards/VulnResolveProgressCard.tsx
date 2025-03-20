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
import { useParams } from "react-router-dom";
import { useVulnProgress } from "~/hooks/fetching/vuln/query";

export default function VulnResolveProgressCard({
  sx,
  value,
}: {
  sx?: SxProps;
  value: number;
}) {
  const { currentProject } = useParams();
  const vulnProgressQuery = useVulnProgress(currentProject);
  const data = vulnProgressQuery.data?.data;
  const percentage =
    data && !isNaN(Math.round(data.resolved / data.total))
      ? Math.round(data.resolved / data.total)
      : 0;
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
              Resolution progress
            </Typography>
            <Typography variant="h4">{`${percentage}%`}</Typography>
          </Stack>
          <Avatar
            sx={{
              backgroundColor: "warning.main",
              height: 56,
              width: 56,
            }}
          >
            <ChecklistRtl />
          </Avatar>
        </Stack>
        <Box sx={{ mt: 3 }}>
          <LinearProgress value={percentage} variant="determinate" />
        </Box>
      </CardContent>
    </Card>
  );
}
