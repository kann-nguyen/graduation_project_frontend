import { BugReport } from "@mui/icons-material";
import {
  Avatar,
  Card,
  CardContent,
  Stack,
  SxProps,
  Typography,
} from "@mui/material";

interface Props {
  total: number;
  sx?: SxProps;
}
export default function TotalVulnerabilities({ total, sx }: Props) {
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
              Total vulnerabilities
            </Typography>
            <Typography variant="h4">{total}</Typography>
          </Stack>
          <Avatar
            sx={{
              backgroundColor: "error.main",
              height: 56,
              width: 56,
            }}
          >
            <BugReport />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}
