import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Stack,
  SxProps,
  Typography,
  useTheme,
} from "@mui/material";
import { Legend, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Vulnerability } from "~/hooks/fetching/artifact";
import Empty from "/empty.png";
interface Props {
  vulnList: Vulnerability[];
  sx?: SxProps;
}
const renderLabel = ({ percent }: { percent: number }) => {
  if (percent < 0.005) {
    return null;
  }
  return `${(percent * 100).toFixed(0)}%`;
};
export default function SeverityStatistics({ vulnList, sx }: Props) {
  const theme = useTheme();
  const negligibleCount = vulnList.filter(
    (vuln) => vuln.severity.toLowerCase() === "negligible"
  ).length;
  const lowCount = vulnList.filter(
    (vuln) => vuln.severity.toLowerCase() === "low"
  ).length;
  const mediumCount = vulnList.filter(
    (vuln) => vuln.severity.toLowerCase() === "medium"
  ).length;
  const highCount = vulnList.filter(
    (vuln) => vuln.severity.toLowerCase() === "high"
  ).length;
  const criticalCount = vulnList.filter(
    (vuln) => vuln.severity.toLowerCase() === "critical"
  ).length;
  const data = [
    {
      name: "Negligible severity",
      value: negligibleCount,
      fill: theme.palette.text.secondary,
    },
    { name: "Low severity", value: lowCount, fill: theme.palette.success.main },
    {
      name: "Medium severity",
      value: mediumCount,
      fill: theme.palette.warning.main,
    },
    { name: "High severity", value: highCount, fill: theme.palette.error.main },
    {
      name: "Critical severity",
      value: criticalCount,
      fill: theme.palette.error.dark,
    },
  ];
  return (
    <Card sx={sx}>
      <CardHeader title="Severity statistics" />
      <CardContent>
        {vulnList.length === 0 ? (
          <Stack sx={{ alignItems: "center" }}>
            <img
              src={Empty}
              style={{
                width: 150,
                height: 150,
              }}
            />
            <Typography variant="h6" color="textSecondary">
              There's nothing here...
            </Typography>
          </Stack>
        ) : (
          <ResponsiveContainer width="100%" minHeight={300}>
            <PieChart>
              <Pie
                innerRadius={80}
                outerRadius={100}
                data={data}
                dataKey="value"
                label={renderLabel}
                labelLine={false}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
