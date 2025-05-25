import { Card, CardContent, CardHeader, Typography, useTheme } from "@mui/material";
import { ApexOptions } from "apexcharts";
import React from "react";
import Chart from "react-apexcharts";
import { Vulnerability } from "~/hooks/fetching/artifact";

interface ScanHistoryEntry {
  timestamp: string;
  vulnerabilities: Vulnerability[];
}

interface ScanHistoryData {
  dates: string[];
  counts: number[];
  critical: number[];
  high: number[];
  medium: number[];
  low: number[];
}

const processScanHistory = (scanHistory?: ScanHistoryEntry[]): ScanHistoryData => {
  if (!scanHistory || scanHistory.length === 0) {
    return {
      dates: [],
      counts: [],
      critical: [],
      high: [],
      medium: [],
      low: [],
    };
  }

  // Sort by timestamp
  const sortedHistory = [...scanHistory].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  return {
    dates: sortedHistory.map(entry => {
      const date = new Date(entry.timestamp);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }),
    counts: sortedHistory.map(entry => entry.vulnerabilities.length),
    critical: sortedHistory.map(entry => 
      entry.vulnerabilities.filter(v => v.severity.toUpperCase() === "CRITICAL").length
    ),
    high: sortedHistory.map(entry => 
      entry.vulnerabilities.filter(v => v.severity.toUpperCase() === "HIGH").length
    ),
    medium: sortedHistory.map(entry => 
      entry.vulnerabilities.filter(v => v.severity.toUpperCase() === "MEDIUM").length
    ),
    low: sortedHistory.map(entry => 
      entry.vulnerabilities.filter(v => v.severity.toUpperCase() === "LOW").length
    ),
  };
};

interface ScanHistoryChartProps {
  scanHistory?: ScanHistoryEntry[];
  title?: string;
}

const ScanHistoryChart: React.FC<ScanHistoryChartProps> = ({ 
  scanHistory = [], 
  title = "Scan History" 
}) => {
  const theme = useTheme();
  const data = processScanHistory(scanHistory);
  
  // Create chart options
  const chartOptions: ApexOptions = {
    chart: {
      type: 'line',
      height: 350,
      toolbar: {
        show: false
      },
      background: 'transparent'
    },
    colors: [
      theme.palette.error.main, // Critical
      theme.palette.warning.main, // High
      theme.palette.info.main, // Medium
      theme.palette.success.main, // Low
      theme.palette.primary.main, // Total
    ],
    dataLabels: {
      enabled: false
    },    stroke: {
      curve: 'straight',
      width: [2, 2, 2, 2, 3], // Total line is a bit thicker
    },
    xaxis: {
      categories: data.dates,
      labels: {
        style: {
          colors: theme.palette.text.secondary
        }
      }
    },
    yaxis: {
      title: {
        text: 'Number of Vulnerabilities',
        style: {
          color: theme.palette.text.primary
        }
      },
      min: 0,
      forceNiceScale: true,
      labels: {
        style: {
          colors: theme.palette.text.secondary
        }
      }
    },
    legend: {
      position: 'top',
      fontSize: '14px',
      labels: {
        colors: theme.palette.text.primary
      }
    },
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: (value) => `${value} vulnerabilities`
      }
    },
    grid: {
      borderColor: theme.palette.divider,
    }
  };

  const series = [
    {
      name: 'Critical',
      data: data.critical
    },
    {
      name: 'High',
      data: data.high
    },
    {
      name: 'Medium',
      data: data.medium
    },
    {
      name: 'Low',
      data: data.low
    },
    {
      name: 'Total',
      data: data.counts
    }
  ];

  // If there is no data, show a message
  if (!data.dates.length) {
    return (
      <Card>
        <CardHeader title={title} />
        <CardContent>
          <Typography variant="body2" color="textSecondary" align="center">
            No scan history available yet
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <Chart 
          options={chartOptions} 
          series={series} 
          type="line" 
          height={350} 
        />
      </CardContent>
    </Card>
  );
};

export default ScanHistoryChart;
