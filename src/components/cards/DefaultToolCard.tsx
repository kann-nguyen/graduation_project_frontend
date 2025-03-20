import { Build } from "@mui/icons-material";
import {
  Avatar,
  Card,
  CardContent,
  Stack,
  SxProps,
  Typography,
} from "@mui/material";
export default function DefaultToolCard({
  name,
  sx,
}: {
  name: string;
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
              Default tool
            </Typography>
            <Typography variant="h4">{name}</Typography>
          </Stack>
          <Avatar
            sx={{
              backgroundColor: "info.main",
              height: 56,
              width: 56,
              transform: "rotate(90deg)",
            }}
          >
            <Build />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}
