import {
  Card,
  CardContent,
  CardHeader,
  SxProps,
  useTheme,
} from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Account } from "~/hooks/fetching/account";

export default function RoleDistributionChart({
  sx,
  accounts,
}: {
  sx?: SxProps;
  accounts: Account[];
}) {
  const theme = useTheme();
  const chartData = Object.values(
    accounts.reduce((summary, account) => {
      if (summary.hasOwnProperty(account.role)) {
        summary[account.role].total++;
      } else {
        summary[account.role] = { role: account.role, total: 1 };
      }
      return summary;
    }, {} as { [key: string]: { role: string; total: number } })
  ) as { role: string; total: number }[];
  const colorFilledChartData = chartData.map((data) => {
    switch (data.role) {
      case "admin":
        return { ...data, fill: theme.palette.primary.main };
      case "project_manager":
        return { ...data, fill: theme.palette.secondary.main };
      case "security_expert":
        return { ...data, fill: theme.palette.warning.main };
      case "member":
        return { ...data, fill: theme.palette.success.main };
      default:
        return { ...data, fill: theme.palette.grey[500] };
    }
  });
  return (
    <Card sx={sx}>
      <CardHeader title="Role distribution" />
      <CardContent>
        <ResponsiveContainer width="100%" minHeight={300}>
          <PieChart>
            <Pie
              innerRadius={80}
              outerRadius={100}
              data={colorFilledChartData}
              dataKey="total"
              nameKey="role"
              label
              labelLine={false}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
