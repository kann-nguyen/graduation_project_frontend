import {
  ArrowBack,
  ArticleOutlined,
  CalendarToday,
  Description,
  Edit,
  MoreVert,
  Security,
  BugReport,
  Link as LinkIcon,
  Label,
  VerifiedUser,
  Save,
  Search,
  Visibility,
  FilterList,
  PieChart as PieChartIcon,
  Assessment,
  Timeline,
  WorkOutline,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Schedule as ScheduleIcon,
  Loop as LoopIcon,
  Assignment as AssignmentIcon,
  Build as BuildIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon
} from "@mui/icons-material";
import React, { useState, useMemo, useEffect, useContext, createContext } from "react";
import { WorkflowCycle, WorkflowStats } from "~/hooks/fetching/workflow";
import { useArtifactWorkflowHistoryQuery } from "~/hooks/fetching/workflow/query";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography,
  useTheme,
  CircularProgress,
  alpha,
  LinearProgress,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Breadcrumbs,
  Link,
  TextField,
  InputAdornment,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  Slider,
} from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useParams, useNavigate } from "react-router-dom";
import { useArtifactQuery, useArtifactPhaseQuery } from "~/hooks/fetching/artifact/query";
import { useThreatQuery } from "~/hooks/fetching/threat/query";
import ScanHistoryChart from "~/components/charts/ScanHistoryChart";
import { Artifact, Vulnerability } from "~/hooks/fetching/artifact";
import UpdateArtifactDialog from "~/components/dialogs/UpdateArtifactDialog";
import { useSearchParams } from "react-router-dom";
import { typeOptions } from "~/utils/threat-display";
import { getThreat } from "~/hooks/fetching/threat/axios";
import { Threat } from "~/hooks/fetching/threat";
import { Legend, Pie, PieChart, ResponsiveContainer, Cell } from "recharts";
import SeverityStatistics from "~/components/charts/SeverityStatisticsChart";
import ThreatStatistics from "~/components/charts/ThreatStatisticsChart";
import { useAccountContext } from '~/hooks/general';
import { useUpdateArtifactRateScanMutation } from '~/hooks/fetching/artifact/query';
import { Collapse } from "@mui/material";
import WorkflowPanel from '~/components/cards/WorkflowPanel';

dayjs.extend(relativeTime);

// Tạo context để chia sẻ dữ liệu threat và vulnerability được cache giữa các component
interface ArtifactDataContextType {
  cachedThreats: Threat[];
  setCachedThreats: React.Dispatch<React.SetStateAction<Threat[]>>;
  isLoadingThreats: boolean;
  setIsLoadingThreats: React.Dispatch<React.SetStateAction<boolean>>;
}

// Context mặc định cho dữ liệu artifact
const ArtifactDataContext = createContext<ArtifactDataContextType>({
  cachedThreats: [],
  setCachedThreats: () => {},
  isLoadingThreats: true,
  setIsLoadingThreats: () => {},
});

// Component header trang cho artifact detail
function PageHeader({ artifact }: { artifact: Artifact }) {
  const navigate = useNavigate();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const { currentProject } = useParams();
  const theme = useTheme();
  
  // Lấy thông tin phase chứa artifact này
  const { data: phaseData, isLoading: isLoadingPhase } = useArtifactPhaseQuery(artifact._id);
  
  const getArtifactTypeColor = (type: string) => {
    switch (type) {
      case "image": return theme.palette.info.main;
      case "source code": return theme.palette.success.main;
      case "log": return theme.palette.warning.main;
      case "executable": return theme.palette.error.main;
      case "library": return theme.palette.secondary.main;
      default: return theme.palette.primary.main;
    }
  };
  
  return (
    <Box sx={{ mb: 4 }}>      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => {
            if (phaseData?.data?.phaseId && currentProject) {
              navigate(`/${encodeURIComponent(currentProject)}/phases/${phaseData.data.phaseId}`);
            } else {
              // Fallback to project home if phase data is not available
              navigate(`/${encodeURIComponent(currentProject || '')}`);
            }
          }}
          sx={{ mr: 2 }}
          variant="text"
          color="inherit"
          disabled={isLoadingPhase}
        >
          {isLoadingPhase ? 'Loading...' : `Back to ${phaseData?.data?.phaseName || 'phase'}`}
        </Button>
      
        <Box sx={{ flexGrow: 1 }} />
        
        <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
          <MoreVert />
        </IconButton>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuItem onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            setMenuAnchor(null);
          }}>
            Copy artifact link
          </MenuItem>
          <MenuItem onClick={() => {
            window.print();
            setMenuAnchor(null);
          }}>
            Print artifact details
          </MenuItem>
        </Menu>
      </Box>
      
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
        {artifact.name}
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Chip 
          icon={<ArticleOutlined />} 
          label={artifact.type}
          color="primary"
          sx={{ 
            bgcolor: getArtifactTypeColor(artifact.type),
            color: 'white',
            fontWeight: 'medium'
          }}
        />
        {artifact.version && (
          <Chip 
            icon={<Label fontSize="small" />} 
            label={`Version: ${artifact.version}`} 
            variant="outlined"
          />
        )}
        <Tooltip title={artifact.url}>
          <Chip 
            icon={<LinkIcon fontSize="small" />} 
            label="Source URL" 
            variant="outlined"
            component="a"
            href={artifact.url}
            target="_blank"
            clickable
          />
        </Tooltip>
      </Box>
    </Box>
  );
}

// Component tóm tắt các lỗ hổng bảo mật
function VulnerabilitiesSummary({ vulnerabilities }: { vulnerabilities: Vulnerability[] }) {
  const theme = useTheme();
  const [viewVulnDialogOpen, setViewVulnDialogOpen] = useState(false);
  
  // Hàm đếm số lượng lỗ hổng theo mức độ nghiêm trọng
  const getVulnerabilitySeverityCounts = () => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0, negligible: 0 };
    vulnerabilities.forEach(vuln => {
      const severity = vuln.severity.toLowerCase();
      if (severity in counts) {
        counts[severity as keyof typeof counts] += 1;
      }
    });
    return counts;
  };
  
  const counts = getVulnerabilitySeverityCounts();
  const total = vulnerabilities.length;
  
  // Dữ liệu cho biểu đồ tròn
  const pieChartData = [
    { name: "Critical", value: counts.critical, fill: theme.palette.error.dark },
    { name: "High", value: counts.high, fill: theme.palette.error.main },
    { name: "Medium", value: counts.medium, fill: theme.palette.warning.main },
    { name: "Low", value: counts.low, fill: theme.palette.success.main },
    { name: "Negligible", value: counts.negligible, fill: theme.palette.grey[400] }
  ].filter(item => item.value > 0);
  
  // Hàm render nhãn cho biểu đồ
  const renderLabel = ({ percent }: { percent: number }) => {
    if (percent < 0.05) return null;
    return `${(percent * 100).toFixed(0)}%`;
  };
  
  // Hiển thị khi không có lỗ hổng nào
  if (vulnerabilities.length === 0) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          textAlign: 'center'
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Vulnerabilities Summary
        </Typography>
        <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <VerifiedUser sx={{ fontSize: 64, color: theme.palette.success.main, mb: 2 }} />
          <Typography variant="h6">No vulnerabilities detected</Typography>
        </Box>
      </Paper>
    );
  }
  
  return (
    <>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Vulnerabilities Summary
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            {/* Chart visualization - made larger */}
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {total > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={1}
                      dataKey="value"
                      label={renderLabel}
                      labelLine={false}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Legend wrapperStyle={{ fontSize: '16px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <VerifiedUser sx={{ fontSize: 48, color: theme.palette.success.main, mb: 1 }} />
                  <Typography variant="h6">No vulnerabilities detected</Typography>
                </Box>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            {/* Counts breakdown - with larger text */}
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                Vulnerability Breakdown:
              </Typography>
              
              <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: theme.palette.error.dark, mr: 1.5 }} />
                  <Typography variant="body1" fontSize="16px">Critical</Typography>
                </Box>
                <Typography variant="body1" fontWeight="bold" fontSize="16px">{counts.critical}</Typography>
              </Box>
              
              <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: theme.palette.error.main, mr: 1.5 }} />
                  <Typography variant="body1" fontSize="16px">High</Typography>
                </Box>
                <Typography variant="body1" fontWeight="bold" fontSize="16px">{counts.high}</Typography>
              </Box>
              
              <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: theme.palette.warning.main, mr: 1.5 }} />
                  <Typography variant="body1" fontSize="16px">Medium</Typography>
                </Box>
                <Typography variant="body1" fontWeight="bold" fontSize="16px">{counts.medium}</Typography>
              </Box>
              
              <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: theme.palette.success.main, mr: 1.5 }} />
                  <Typography variant="body1" fontSize="16px">Low</Typography>
                </Box>
                <Typography variant="body1" fontWeight="bold" fontSize="16px">{counts.low}</Typography>
              </Box>
              
              <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: theme.palette.grey[400], mr: 1.5 }} />
                  <Typography variant="body1" fontSize="16px">Negligible</Typography>
                </Box>
                <Typography variant="body1" fontWeight="bold" fontSize="16px">{counts.negligible}</Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">Total Vulnerabilities:</Typography>
                <Typography variant="h6" fontWeight="bold">{total}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      
        
        {/* View All Vulnerabilities button added to this section */}
        {vulnerabilities.length > 0 && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              startIcon={<BugReport />}
              size="large"
              onClick={() => setViewVulnDialogOpen(true)}
              sx={{ px: 4, py: 1, fontSize: '16px' }}
            >
              View All Vulnerabilities ({vulnerabilities.length})
            </Button>
          </Box>
        )}
      </Paper>
      
      {/* Vulnerabilities Dialog */}
      <Dialog 
        open={viewVulnDialogOpen} 
        onClose={() => setViewVulnDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">All Vulnerabilities</Typography>
            <IconButton onClick={() => setViewVulnDialogOpen(false)}>
              <MoreVert />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <SearchableVulnerabilitiesList vulnerabilities={vulnerabilities || []} />
        </DialogContent>
      </Dialog>
    </>
  );
}

// Component tóm tắt các mối đe dọa
function ThreatSummary({ threatList }: { threatList: (string | { _id: string })[] }) {
  const theme = useTheme();
  const { cachedThreats, setCachedThreats, isLoadingThreats, setIsLoadingThreats } = useContext(ArtifactDataContext);
  const [viewThreatsDialogOpen, setViewThreatsDialogOpen] = useState(false);
  
  // Theo dõi số lượng theo loại mối đe dọa
  const [threatTypeCounts, setThreatTypeCounts] = useState<{[key: string]: number}>({
    'Spoofing': 0,
    'Tampering': 0,
    'Repudiation': 0,
    'Information Disclosure': 0,
    'Denial of Service': 0,
    'Elevation of Privilege': 0,
    'Unknown': 0
  });
  
  // Thêm các biến state để debug
  const [debugInfo, setDebugInfo] = useState<{
    processedCount: number,
    successCount: number,
    errorCount: number,
    threatSamples: any[],
    lastError: string | null
  }>({
    processedCount: 0,
    successCount: 0,
    errorCount: 0,
    threatSamples: [],
    lastError: null
  });

  // Lấy tất cả dữ liệu mối đe dọa để hiển thị trong tóm tắt
  useEffect(() => {
    const fetchThreats = async () => {
      if (!threatList?.length) {
        setIsLoadingThreats(false);
        return;
      }
      
      // Bỏ qua việc fetch nếu đã có cached threats
      if (cachedThreats.length > 0) {
        processThreats(cachedThreats);
        setIsLoadingThreats(false);
        return;
      }
      
      const typeCounts = {
        'Spoofing': 0,
        'Tampering': 0,
        'Repudiation': 0,
        'Information Disclosure': 0,
        'Denial of Service': 0,
        'Elevation of Privilege': 0,
        'Unknown': 0
      };
      
      let processedCount = 0;
      let successCount = 0;
      let errorCount = 0;
      let threatSamples: any[] = [];
      let lastError = null;
      
      const maxThreatsToProcess = Math.min(50, threatList.length);
      const fetchedThreats: Threat[] = [];
      
      for (let i = 0; i < maxThreatsToProcess; i++) {
        const threatItem = threatList[i];
        processedCount++;
        
        try {
          const threatIdValue = typeof threatItem === 'string' ? threatItem : (threatItem as { _id: string })._id;
          
          const threatResponse = await getThreat(threatIdValue);
          const threat = threatResponse.data;
          
          if (!threat) {
            errorCount++;
            continue;
          }
          
          successCount++;
          fetchedThreats.push(threat);
          
          // Store a few samples for debug display
          if (threatSamples.length < 3) {
            threatSamples.push({
              id: threat._id,
              name: threat.name,
              type: threat.type
            });
          }
          
          // Count by type
          if (threat.type) {
            if (threat.type in typeCounts) {
              typeCounts[threat.type as keyof typeof typeCounts]++;
            } else {
              typeCounts['Unknown']++;
            }
          } else {
            typeCounts['Unknown']++;
          }
          
          // Update debug info regularly
          if (processedCount % 10 === 0) {
            setDebugInfo({
              processedCount,
              successCount,
              errorCount,
              threatSamples,
              lastError
            });
          }
        } catch (error) {
          errorCount++;
          lastError = error instanceof Error ? error.message : 'Unknown error';
        }
      }
      
      // Cache the fetched threats for reuse
      setCachedThreats(fetchedThreats);
      
      // Final update of all state
      setThreatTypeCounts(typeCounts);
      setIsLoadingThreats(false);
      setDebugInfo({
        processedCount,
        successCount,
        errorCount,
        threatSamples,
        lastError
      });
    };

    const processThreats = (threats: Threat[]) => {
      const typeCounts = {
        'Spoofing': 0,
        'Tampering': 0,
        'Repudiation': 0,
        'Information Disclosure': 0,
        'Denial of Service': 0,
        'Elevation of Privilege': 0,
        'Unknown': 0
      };
      
      threats.forEach(threat => {
        // Count by type
        if (threat.type) {
          if (threat.type in typeCounts) {
            typeCounts[threat.type as keyof typeof typeCounts]++;
          } else {
            typeCounts['Unknown']++;
          }
        } else {
          typeCounts['Unknown']++;
        }
      });
      
      setThreatTypeCounts(typeCounts);
    };
    
    fetchThreats();
  }, [threatList, cachedThreats, setCachedThreats, setIsLoadingThreats]);

  // Get threat type icon and color
  const getThreatTypeInfo = (type: string) => {
    switch (type) {
      case 'Spoofing': 
        return { icon: '👤', color: theme.palette.error.main };
      case 'Tampering': 
        return { icon: '🔧', color: theme.palette.warning.main };
      case 'Repudiation': 
        return { icon: '❌', color: theme.palette.error.dark };
      case 'Information Disclosure': 
        return { icon: '🔍', color: theme.palette.info.main };
      case 'Denial of Service': 
        return { icon: '⛔', color: theme.palette.warning.dark };
      case 'Elevation of Privilege': 
        return { icon: '🔑', color: theme.palette.secondary.main };
      default: 
        return { icon: '⚠️', color: theme.palette.grey[500] };
    }
  };
  
  if (!threatList || threatList.length === 0) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          textAlign: 'center'
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Threats Summary
        </Typography>
        <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Security sx={{ fontSize: 64, color: theme.palette.grey[400], mb: 2 }} />
          <Typography variant="h6">No threats associated with this artifact</Typography>
        </Box>
      </Paper>
    );
  }

  // Filter to only show types with counts > 0
  const threatTypesWithCounts = Object.entries(threatTypeCounts)
    .filter(([type, count]) => count > 0 && type !== 'Unknown')
    .sort(([_, countA], [__, countB]) => countB - countA);
  
  const noThreatsFound = threatTypesWithCounts.length === 0;

  // Calculate total threats (from the counts, not the list length which may not be fetched yet)
  const totalThreats = Object.values(threatTypeCounts).reduce((sum, count) => sum + count, 0);
  
  // Prepare data for pie chart
  const pieChartData = Object.entries(threatTypeCounts)
    .filter(([type, count]) => count > 0 && type !== 'Unknown')
    .map(([type, value]) => {
      const { color } = getThreatTypeInfo(type);
      return { 
        name: type, 
        value,
        fill: color
      };
    });
  
  const renderLabel = ({ percent }: { percent: number }) => {
    if (percent < 0.05) return null;
    return `${(percent * 100).toFixed(0)}%`;
  };

  return (
    <>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Threats Summary {isLoadingThreats && <CircularProgress size={16} sx={{ ml: 1, verticalAlign: 'middle' }} />}
        </Typography>
        
        {isLoadingThreats ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={50} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Loading threats data ({debugInfo.processedCount}/{threatList.length})...
            </Typography>
          </Box>
        ) : noThreatsFound ? (
          <Box>
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Security sx={{ fontSize: 64, color: theme.palette.warning.main, mb: 2 }} />
              <Typography color="warning.main" variant="h6" gutterBottom>
                No threat type information found
              </Typography>
              <Typography color="text.secondary" fontSize="16px">
                {threatList.length} threats exist, but could not extract proper STRIDE type information from them.
              </Typography>
            </Box>
          </Box>
        ) : (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                {/* Pie chart visualization - made larger */}
                <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={1}
                        dataKey="value"
                        label={renderLabel}
                        labelLine={false}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Legend wrapperStyle={{ fontSize: '16px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                {/* Threats breakdown - with larger text */}
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                    Threats Breakdown:
                  </Typography>
                  
                  {threatTypesWithCounts.map(([type, count]) => {
                    const { icon, color } = getThreatTypeInfo(type);
                    return (
                      <Box key={type} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography sx={{ mr: 1.5, width: 24, fontSize: '20px' }}>{icon}</Typography>
                          <Typography variant="body1" fontSize="16px">{type}</Typography>
                        </Box>
                        <Typography variant="body1" fontWeight="bold" fontSize="16px">{count}</Typography>
                      </Box>
                    );
                  })}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Total Threats:</Typography>
                    <Typography variant="h6" fontWeight="bold">{totalThreats}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
            
            {/* View All Threats button added to this section */}
            {threatList.length > 0 && (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<Security />}
                  size="large"
                  onClick={() => setViewThreatsDialogOpen(true)}
                  sx={{ px: 4, py: 1, fontSize: '16px' }}
                >
                  View All Threats ({threatList.length})
                </Button>
              </Box>
            )}
          </>
        )}
      </Paper>
      
      {/* Threats Dialog */}
      <Dialog 
        open={viewThreatsDialogOpen} 
        onClose={() => setViewThreatsDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">All Associated Threats</Typography>
            <IconButton onClick={() => setViewThreatsDialogOpen(false)}>
              <MoreVert />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <SearchableThreatsSection 
            threatList={threatList} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

function SearchableVulnerabilitiesList({ vulnerabilities }: { vulnerabilities: Vulnerability[] }) {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>([]);
  
  const severityOptions = ['critical', 'high', 'medium', 'low', 'negligible'];
  
  const filteredVulnerabilities = useMemo(() => {
    return vulnerabilities.filter(vuln => {
      // Filter by search term
      const matchesSearch = searchTerm === '' || 
        vuln.cveId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vuln.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vuln.cwes.some(cwe => cwe.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filter by severity
      const matchesSeverity = selectedSeverities.length === 0 || 
        selectedSeverities.includes(vuln.severity.toLowerCase());
      
      return matchesSearch && matchesSeverity;
    });
  }, [vulnerabilities, searchTerm, selectedSeverities]);
  
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical": return theme.palette.error.main;
      case "high": return theme.palette.warning.main;
      case "medium": return theme.palette.info.main;
      case "low": return theme.palette.success.main;
      case "negligible": return theme.palette.grey[400];
      default: return theme.palette.grey[500];
    }
  };
  
  if (vulnerabilities.length === 0) {
    return null;
  }
  
  return (
    <>
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search vulnerabilities by CVE ID, description, or CWEs..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterList sx={{ fontSize: 18, mr: 0.5 }} /> Filter by severity:
          </Typography>
          {severityOptions.map((severity) => (
            <Chip
              key={severity}
              label={severity.charAt(0).toUpperCase() + severity.slice(1)}
              onClick={() => {
                setSelectedSeverities(prev => 
                  prev.includes(severity) 
                    ? prev.filter(s => s !== severity) 
                    : [...prev, severity]
                )
              }}
              color={selectedSeverities.includes(severity) ? 'primary' : 'default'}
              variant={selectedSeverities.includes(severity) ? 'filled' : 'outlined'}
              sx={{ 
                bgcolor: selectedSeverities.includes(severity) ? getSeverityColor(severity) : 'transparent',
                borderColor: getSeverityColor(severity),
                color: selectedSeverities.includes(severity) ? 'white' : 'inherit'
              }}
            />
          ))}
          
          {selectedSeverities.length > 0 && (
            <Chip 
              label="Clear filters" 
              onClick={() => setSelectedSeverities([])}
              variant="outlined"
              size="small"
            />
          )}
        </Box>
      </Box>
      
      {filteredVulnerabilities.length > 0 ? (
        <List sx={{ width: '100%' }}>
          {filteredVulnerabilities.map((vuln) => (
            <Paper
              key={vuln._id}
              elevation={0}
              sx={{
                mb: 2,
                border: `1px solid ${theme.palette.divider}`,
                borderLeft: `5px solid ${getSeverityColor(vuln.severity)}`,
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <ListItem
                alignItems="flex-start"
                sx={{
                  py: 2
                }}
              >
                <ListItemIcon sx={{ minWidth: 56 }}>
                  <Avatar
                    sx={{
                      bgcolor: getSeverityColor(vuln.severity),
                      color: 'white',
                      width: 40,
                      height: 40,
                    }}
                  >
                    <BugReport />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="h6" component="span">
                        {vuln.cveId}
                      </Typography>
                      <Chip
                        label={vuln.severity}
                        size="small"
                        sx={{
                          backgroundColor: getSeverityColor(vuln.severity),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                      {vuln.score && (
                        <Chip
                          label={`CVSS: ${vuln.score.toFixed(1)}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {vuln.description}
                      </Typography>
                      {vuln.cwes?.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                          {vuln.cwes.slice(0, 3).map((cwe, index) => (
                            <Chip
                              key={index}
                              label={cwe}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                          {vuln.cwes.length > 3 && (
                            <Chip
                              label={`+${vuln.cwes.length - 3} more`}
                              size="small"
                              variant="outlined"
                              color="primary"
                            />
                          )}
                        </Box>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            </Paper>
          ))}
        </List>
      ) : (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography color="text.secondary">
            No vulnerabilities match your search criteria
          </Typography>
        </Box>
      )}
    </>
  );
}

function SearchableThreatsSection({ threatList }: { threatList: (string | { _id: string })[] }) {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const { cachedThreats, isLoadingThreats } = useContext(ArtifactDataContext);
  
  // STRIDE threat types
  const threatTypeOptions = [
    'Spoofing', 
    'Tampering', 
    'Repudiation', 
    'Information Disclosure', 
    'Denial of Service', 
    'Elevation of Privilege'
  ];
  
  const filteredThreats = useMemo(() => {
    return cachedThreats.filter(threat => {
      // Filter by search term
      const matchesSearch = searchTerm === '' || 
        threat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        threat.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        threat.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by type
      const matchesType = selectedTypes.length === 0 || 
        selectedTypes.includes(threat.type);
      
      return matchesSearch && matchesType;
    });
  }, [cachedThreats, searchTerm, selectedTypes]);
  
  // Get threat type icon and color
  const getThreatTypeInfo = (type: string) => {
    switch (type) {
      case 'Spoofing': 
        return { icon: '👤', color: theme.palette.error.main };
      case 'Tampering': 
        return { icon: '🔧', color: theme.palette.warning.main };
      case 'Repudiation': 
        return { icon: '❌', color: theme.palette.error.dark };
      case 'Information Disclosure': 
        return { icon: '🔍', color: theme.palette.info.main };
      case 'Denial of Service': 
        return { icon: '⛔', color: theme.palette.warning.dark };
      case 'Elevation of Privilege': 
        return { icon: '🔑', color: theme.palette.secondary.main };
      default: 
        return { icon: '⚠️', color: theme.palette.grey[500] };
    }
  };
  
  if (isLoadingThreats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!threatList || threatList.length === 0) {
    return (
      <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Security sx={{ fontSize: 48, color: theme.palette.grey[400], mb: 2 }} />
        <Typography>No threats associated with this artifact</Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search threats by name, type, or description..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        
        {/* Type filter chips */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterList sx={{ fontSize: 18, mr: 0.5 }} /> Filter by type:
          </Typography>
          {threatTypeOptions.map((type) => {
            const { color } = getThreatTypeInfo(type);
            return (
              <Chip
                key={type}
                label={type}
                onClick={() => {
                  setSelectedTypes(prev => 
                    prev.includes(type) 
                      ? prev.filter(t => t !== type) 
                      : [...prev, type]
                  )
                }}
                color={selectedTypes.includes(type) ? 'primary' : 'default'}
                variant={selectedTypes.includes(type) ? 'filled' : 'outlined'}
                sx={{ 
                  bgcolor: selectedTypes.includes(type) ? color : 'transparent',
                  borderColor: color,
                  color: selectedTypes.includes(type) ? 'white' : 'inherit'
                }}
              />
            );
          })}
          
          {selectedTypes.length > 0 && (
            <Chip 
              label="Clear filters" 
              onClick={() => setSelectedTypes([])}
              variant="outlined"
              size="small"
            />
          )}
        </Box>
      </Box>
      
      {filteredThreats.length > 0 ? (
        <Grid container spacing={2}>
          {filteredThreats.map(threat => {
            const { icon, color } = getThreatTypeInfo(threat.type);
            return (
              <Grid item xs={12} key={threat._id}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    overflow: 'visible'
                  }}
                >
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      p: 2,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      bgcolor: alpha(theme.palette.background.default, 0.6),
                    }}
                  >
                    <Typography variant="h6" sx={{ mr: 1.5 }}>{icon}</Typography>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {threat.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          STRIDE Type: {threat.type}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label={threat.type}
                      sx={{ 
                        bgcolor: color,
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                  
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="body2">
                      {threat.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography color="text.secondary">
            No threats match your search criteria
          </Typography>
        </Box>
      )}
    </>
  );
}

function ArtifactInfoSection({ artifact, onEditClick }: { artifact: Artifact, onEditClick: () => void }) {
  const theme = useTheme();
  const [rateValue, setRateValue] = useState<number>(artifact.rateReScan || 50);
  const [isEditing, setIsEditing] = useState(false);
  const account = useAccountContext();
  const isManager = account?.role === 'project_manager';
  
  const updateRateScanMutation = useUpdateArtifactRateScanMutation();

  const handleRateChange = (event: any, newValue: number | number[]) => {
    setRateValue(newValue as number);
  };

  const handleRateSave = () => {
    updateRateScanMutation.mutate({
      artifactId: artifact._id,
      rate: rateValue
    });
    setIsEditing(false);
  };
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        mb: 3,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Artifact Information
        </Typography>
        <Button
          startIcon={<Edit />}
          variant="outlined"
          size="small"
          onClick={onEditClick}
        >
          Edit
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <Description sx={{ color: 'text.secondary', mr: 2, mt: 0.5 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Source URL
              </Typography>
              <Typography variant="body1" component="a" href={artifact.url} target="_blank" sx={{ wordBreak: 'break-all' }}>
                {artifact.url}
              </Typography>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Label sx={{ color: 'text.secondary', mr: 2 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Type
              </Typography>
              <Typography variant="body1">
                {artifact.type}
              </Typography>
            </Box>
          </Box>
        </Grid>
        
        {artifact.version && (
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Save sx={{ color: 'text.secondary', mr: 2 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Version
                </Typography>
                <Typography variant="body1">
                  {artifact.version}
                </Typography>
              </Box>
            </Box>
          </Grid>
        )}
        
        {artifact.cpe && (
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <VerifiedUser sx={{ color: 'text.secondary', mr: 2 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  CPE
                </Typography>
                <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                  {artifact.cpe}
                </Typography>
              </Box>
            </Box>
          </Grid>
        )}
        
        {/* Rescan Rate Configuration Section */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 2 }}>
            <Security sx={{ color: 'text.secondary', mr: 2, mt: 0.5 }} />
            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Rescan Rate
                </Typography>
                {isManager && (
                  isEditing ? (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        onClick={() => {
                          setRateValue(artifact.rateReScan || 50);
                          setIsEditing(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="small" 
                        variant="contained" 
                        onClick={handleRateSave}
                        disabled={updateRateScanMutation.isLoading}
                      >
                        {updateRateScanMutation.isLoading ? 'Saving...' : 'Save'}
                      </Button>
                    </Box>
                  ) : (
                    <Button 
                      size="small" 
                      variant="outlined" 
                      onClick={() => setIsEditing(true)}
                      startIcon={<Edit fontSize="small" />}
                    >
                      Configure
                    </Button>
                  )
                )}
              </Box>
              
              {isEditing ? (
                <Box sx={{ px: 1, py: 2 }}>
                  <Slider
                    value={rateValue}
                    onChange={handleRateChange}
                    valueLabelDisplay="auto"
                    step={5}
                    marks
                    min={0}
                    max={100}
                    sx={{
                      '& .MuiSlider-markLabel': {
                        fontSize: '0.75rem',
                      },
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">Lower rescan frequency</Typography>
                    <Typography variant="caption" color="text.secondary">Higher rescan frequency</Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={artifact.rateReScan || 50} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 2, 
                      flexGrow: 1,
                      backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.primary.main, 0.1)
                    }} 
                  />
                  <Typography variant="body2" fontWeight="bold">
                    {artifact.rateReScan || 50}%
                  </Typography>
                </Box>
              )}
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {artifact.rateReScan || 50 > 70 
                  ? "High frequency: Artifact will be scanned more frequently to detect vulnerabilities promptly."
                  : artifact.rateReScan || 50 > 30
                  ? "Moderate frequency: Balanced approach to rescanning this artifact."
                  : "Low frequency: This artifact is scanned less frequently to conserve resources."}
              </Typography>
              
              {!isManager && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Note: Only managers can change the rescan rate.
                </Typography>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default function ArtifactDetail() {
  const navigate = useNavigate();
  const { currentProject, artifactId } = useParams();
  const artifactQuery = useArtifactQuery(artifactId || '');
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [viewVulnDialogOpen, setViewVulnDialogOpen] = useState(false);
  const [viewThreatsDialogOpen, setViewThreatsDialogOpen] = useState(false);
  
  // State for caching fetched data
  const [cachedThreats, setCachedThreats] = useState<Threat[]>([]);
  const [isLoadingThreats, setIsLoadingThreats] = useState(true);

  // Context provider value
  const artifactDataContextValue = {
    cachedThreats,
    setCachedThreats,
    isLoadingThreats,
    setIsLoadingThreats,
  };
  
  if (artifactQuery.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!artifactId || !artifactQuery.data?.data) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        gap: 2
      }}>
        <Typography variant="h5" color="error">Artifact not found</Typography>
        <Button 
          variant="contained" 
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/${encodeURIComponent(currentProject || '')}`)}
        >
          Back to project
        </Button>
      </Box>
    );
  }

  const artifact = artifactQuery.data.data;
  
  const handleOpenUpdateDialog = () => {
    // Set the artifactId in the search params to be used by the dialog
    searchParams.set('artifactId', artifactId || '');
    setSearchParams(searchParams);
    setUpdateDialogOpen(true);
  };

  const hasVulnerabilities = artifact.vulnerabilityList && artifact.vulnerabilityList.length > 0;
  const hasThreats = artifact.threatList && artifact.threatList.length > 0;

  return (
    <ArtifactDataContext.Provider value={artifactDataContextValue}>
      <Box 
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          bgcolor: theme.palette.mode === 'dark' ? 'background.default' : alpha(theme.palette.primary.light, 0.02),
        }}
      >
        <Container sx={{ py: 4 }} maxWidth="xl">
          <PageHeader artifact={artifact} />
            <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>              <Stack spacing={3}>
                {/* Workflow Panel - Moved to the top */}
                <WorkflowPanelSection artifactId={artifact._id} />
                
                {/* Vulnerability Summary */}
                <VulnerabilitiesSummary vulnerabilities={artifact.vulnerabilityList || []} />
              
                {/* Threat Summary */}
                <ThreatSummary threatList={artifact.threatList?.map(threat => 
                  typeof threat === 'string' ? threat : threat._id
                ) || []} />
              
                {/* Scan History Chart */}
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    mb: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Timeline sx={{ mr: 1 }} /> Vulnerability Scan History
                  </Typography>
                  <ScanHistoryChart scanHistory={artifact.scanHistory} />
                </Paper>
              </Stack>
            </Grid>
            
            <Grid item xs={12} lg={4}>
              <ArtifactInfoSection 
                artifact={artifact} 
                onEditClick={handleOpenUpdateDialog} 
              />
            </Grid>
          </Grid>
        </Container>
        
        {/* Update Artifact Dialog */}
        <UpdateArtifactDialog
          open={updateDialogOpen}
          setOpen={setUpdateDialogOpen}
        />
        
        {/* Vulnerabilities Dialog */}
        <Dialog 
          open={viewVulnDialogOpen} 
          onClose={() => setViewVulnDialogOpen(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">All Vulnerabilities</Typography>
              <IconButton onClick={() => setViewVulnDialogOpen(false)}>
                <MoreVert />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <SearchableVulnerabilitiesList vulnerabilities={artifact.vulnerabilityList || []} />
          </DialogContent>
        </Dialog>
        
        {/* Threats Dialog */}
        <Dialog 
          open={viewThreatsDialogOpen} 
          onClose={() => setViewThreatsDialogOpen(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">All Associated Threats</Typography>
              <IconButton onClick={() => setViewThreatsDialogOpen(false)}>
                <MoreVert />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <SearchableThreatsSection 
              threatList={artifact.threatList?.map(threat => 
                typeof threat === 'string' ? threat : threat._id
              ) || []} 
            />
          </DialogContent>
        </Dialog>      </Box>
    </ArtifactDataContext.Provider>
  );
}

// Workflow Panel Section Component
function WorkflowPanelSection({ artifactId }: { artifactId: string }) {
  const { data: workflowHistory, isLoading, error } = useArtifactWorkflowHistoryQuery(artifactId);
  const theme = useTheme();
  
  useEffect(() => {
    if (error) {
      console.error("Error in WorkflowPanelSection:", error);
    }
    
    if (workflowHistory) {
      console.log("Workflow history received:", workflowHistory);
    }
  }, [workflowHistory, error]);
  
  // If loading, show a loading indicator
  if (isLoading) {
    return (
      <Paper
        elevation={0}
        sx={{ 
          p: 3, 
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          minHeight: 200
        }}
      >
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography color="text.secondary">Loading workflow data...</Typography>
      </Paper>
    );
  }
  
  // If there's an error, show error message with retry button
  if (error) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <WorkOutline sx={{ mr: 1 }} /> Workflow Status
        </Typography>
        <Box sx={{ py: 3, textAlign: 'center' }}>
          <Typography color="error.main" gutterBottom>
            Error loading workflow data
          </Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
            We encountered an issue while retrieving workflow information.
            This might be because the workflow tracking system is still initializing.
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => window.location.reload()}
            startIcon={<RefreshIcon />}
          >
            Reload Page
          </Button>
        </Box>
      </Paper>
    );
  }
  
  // If the API call was successful but no data
  if (!workflowHistory || !workflowHistory.data || 
      (Array.isArray(workflowHistory.data) && workflowHistory.data.length === 0)) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <WorkOutline sx={{ mr: 1 }} /> Security Workflow Process
        </Typography>
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography color="text.secondary" paragraph>
            No workflow data available for this artifact yet.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Workflow tracking will be initialized automatically after security scans are completed.
          </Typography>
        </Box>
      </Paper>
    );
  }
  
  // Try to handle data even if it's in an unexpected format
  let workflowData = [];
  
  if (workflowHistory?.data) {
    if (Array.isArray(workflowHistory.data)) {
      workflowData = workflowHistory.data;
    } else if ((workflowHistory.data as any).workflowCycles && Array.isArray((workflowHistory.data as any).workflowCycles)) {
      workflowData = (workflowHistory.data as any).workflowCycles;
    } else {
      console.warn("Unexpected workflow data format:", workflowHistory.data);
    }
  }
  
  // Create a custom Workflow Panel with horizontal steps
  // Enhanced to show more details and highlight the current step
  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 3, 
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2
      }}
    >
      <HorizontalWorkflowPanel 
        workflowCycles={workflowData} 
      />
    </Paper>
  );
}

// Horizontal Workflow Panel Component
function HorizontalWorkflowPanel({ workflowCycles }: { workflowCycles: WorkflowCycle[] }) {
  const theme = useTheme();
  const [selectedStep, setSelectedStep] = useState<number>(0); // Track selected step (0 = none)
  
  if (!workflowCycles || workflowCycles.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No workflow data available
        </Typography>
      </Box>
    );
  }
  
  // Sort cycles by cycleNumber to ensure they are in order
  const sortedCycles = [...workflowCycles].sort((a, b) => a.cycleNumber - b.cycleNumber);
  
  // Get the latest cycle
  const latestCycle = sortedCycles[sortedCycles.length - 1];
  const currentStep = latestCycle.currentStep || 1;
  
  // Icons and labels for each step
  const stepData = [
    { 
      label: "Detection", 
      icon: <BugReport />,
      color: theme.palette.info.main,
      data: latestCycle.detection,
      metrics: latestCycle.detection ? [
        { label: "Vulnerabilities", value: latestCycle.detection.numberVuls || 0 }
      ] : []
    },
    { 
      label: "Classification", 
      icon: <Security />,
      color: theme.palette.info.main,
      data: latestCycle.classification,
      metrics: latestCycle.classification ? [
        { label: "Threats", value: latestCycle.classification.numberThreats || 0 }
      ] : []
    },
    { 
      label: "Assignment", 
      icon: <AssignmentIcon />,
      color: theme.palette.info.main,
      data: latestCycle.assignment,
      metrics: latestCycle.assignment ? [
        { label: "Assigned", value: latestCycle.assignment.numberTicketsAssigned || 0 },
        { label: "Unassigned", value: latestCycle.assignment.numberTicketsNotAssigned || 0 }
      ] : []
    },
    { 
      label: "Remediation", 
      icon: <BuildIcon />,
      color: theme.palette.info.main,
      data: latestCycle.remediation,
      metrics: latestCycle.remediation ? [
        { label: "Submitted", value: latestCycle.remediation.numberTicketsSubmitted || 0 },
        { label: "Not Submitted", value: latestCycle.remediation.numberTicketsNotSubmitted || 0 }
      ] : []
    },
    { 
      label: "Verification", 
      icon: <VerifiedUser />,
      color: theme.palette.info.main,
      data: latestCycle.verification,
      metrics: latestCycle.verification ? [
        { label: "Resolved", value: latestCycle.verification.numberTicketsResolved || 0 },
        { label: "Returned", value: latestCycle.verification.numberTicketsReturnedToProcessing || 0 }
      ] : []
    }
  ];

  return (
    <>
      <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <LoopIcon sx={{ mr: 1 }} /> Security Workflow Process
      </Typography>
        <Grid container spacing={1} alignItems="flex-start" sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center', 
            mb: 1
          }}>
            <Typography variant="subtitle1">
              Current Cycle: {latestCycle.cycleNumber}
            </Typography>
            <Chip 
              size="small" 
              label={latestCycle.completedAt ? 'Completed' : 'In Progress'}
              color={latestCycle.completedAt ? 'success' : 'warning'}
            />
          </Box>
        </Grid>
        
        {/* Horizontal Step Container - Only Labels */}
        {stepData.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = stepNumber < currentStep;
          const isPending = stepNumber > currentStep;
          const isSelected = selectedStep === stepNumber;
          
          return (
            <Grid item xs={12} sm={2.4} key={index}>
              <Paper
                elevation={0}
                onClick={() => setSelectedStep(stepNumber === selectedStep ? 0 : stepNumber)}
                sx={{
                  p: 1.5,
                  backgroundColor: 
                    isSelected ? alpha(step.color, 0.15) :
                    isActive ? alpha(step.color, 0.1) : 
                    isCompleted ? alpha(theme.palette.success.main, 0.05) : 
                    alpha(theme.palette.grey[200], 0.5),
                  border: `1px solid ${
                    isSelected ? step.color :
                    isActive ? step.color : 
                    isCompleted ? theme.palette.success.main : 
                    theme.palette.divider
                  }`,
                  borderRadius: 2,
                  transition: 'all 0.2s ease-in-out',
                  position: 'relative',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 1,
                    borderColor: isSelected ? step.color : theme.palette.primary.main
                  },
                  '&::after': (isActive || isCompleted || isSelected) ? {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    backgroundColor: isSelected ? step.color : isActive ? step.color : theme.palette.success.main,
                    borderTopLeftRadius: 2,
                    borderTopRightRadius: 2,
                  } : {}
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center'
                }}>
                  <Typography 
                    variant="subtitle2" 
                    fontWeight={isSelected || isActive ? 'bold' : 'medium'}
                    sx={{ 
                      color: isSelected ? step.color : 
                             isActive ? step.color : 
                             isCompleted ? theme.palette.success.main : 
                             'text.secondary',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Box component="span" 
                      sx={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        width: 24,
                        height: 24,
                        bgcolor: isSelected ? step.color :
                                isActive ? step.color : 
                                isCompleted ? theme.palette.success.main : 
                                'transparent',
                        color: (isActive || isCompleted || isSelected) ? 'white' : 'text.secondary',
                        border: isPending ? `1px solid ${theme.palette.divider}` : 'none',
                        mr: 1,
                        fontSize: '0.75rem'
                      }}
                    >
                      {isCompleted ? <CheckIcon fontSize="small" /> : stepNumber}
                    </Box>
                    {step.label}
                  </Typography>
                  
                  {step.icon}
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
      
      {/* Step Details Box - Shows when a step is selected */}
      {selectedStep > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            border: `1px solid ${stepData[selectedStep-1].color}`,
            borderRadius: 2,
            backgroundColor: alpha(stepData[selectedStep-1].color, 0.05)
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ 
              color: stepData[selectedStep-1].color,
              display: 'flex',
              alignItems: 'center'
            }}>
              {stepData[selectedStep-1].icon}
              <Box component="span" sx={{ ml: 1 }}>
                {stepData[selectedStep-1].label} Details
              </Box>
            </Typography>
            
            <Chip 
              size="small"
              label={
                selectedStep < currentStep ? 'Completed' : 
                selectedStep === currentStep ? 'In Progress' : 
                'Not Started'
              }
              color={
                selectedStep < currentStep ? 'success' :
                selectedStep === currentStep ? 'primary' :
                'default'
              }
            />
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={3}>
            {/* Step Metrics with more details */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Metrics
              </Typography>
              
              {stepData[selectedStep-1].metrics.length > 0 ? (
                stepData[selectedStep-1].metrics.map((metric, idx) => (
                  <Box 
                    key={idx} 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                      p: 1,
                      bgcolor: alpha(theme.palette.background.default, 0.5),
                      borderRadius: 1
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {metric.label}:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {metric.value}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Box sx={{ 
                  p: 2, 
                  textAlign: 'center', 
                  bgcolor: alpha(theme.palette.background.default, 0.5),
                  borderRadius: 1
                }}>
                  <Typography variant="body2" color="text.secondary">
                    No metrics available for this step
                  </Typography>
                </Box>
              )}
            </Grid>
            
            {/* Step Timing Information */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Timing Information
              </Typography>
              
              <Box sx={{ 
                p: 2, 
                bgcolor: alpha(theme.palette.background.default, 0.5),
                borderRadius: 1
              }}>
                {stepData[selectedStep-1].data?.completedAt ? (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Completed:</Typography>
                      <Typography variant="body2">
                        {dayjs(stepData[selectedStep-1].data?.completedAt).format('MMM D, YYYY, h:mm A')}
                      </Typography>
                    </Box>
                    {selectedStep > 1 && stepData[selectedStep-2].data?.completedAt && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Duration:</Typography>
                        <Typography variant="body2">
                          {dayjs(stepData[selectedStep-1].data?.completedAt).from(
                            dayjs(stepData[selectedStep-2].data?.completedAt), true
                          )}
                        </Typography>
                      </Box>
                    )}
                  </>
                ) : selectedStep === currentStep ? (
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ 
                      color: stepData[selectedStep-1].color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <LoopIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Currently in progress
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      This step has not been started yet
                    </Typography>
                  </Box>
                )}
              </Box>
            
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* Workflow History Section */}
      {workflowCycles.length > 1 && (
        <WorkflowHistoryTimeline cycles={sortedCycles.slice(0, -1).reverse()} />
      )}
    </>
  );
}

// WorkflowHistoryTimeline Component - Updated to include dates for all steps
function WorkflowHistoryTimeline({ cycles }: { cycles: WorkflowCycle[] }) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleExpandClick = (cycleId: string) => {
    setExpanded(expanded === cycleId ? false : cycleId);
  };

  if (!cycles || cycles.length === 0) return null;

  return (
    <>
      <Typography variant="h6" sx={{ mt: 4, mb: 3, display: 'flex', alignItems: 'center' }}>
        <Timeline sx={{ mr: 1 }} /> Workflow History
      </Typography>
      
      <Box sx={{ pl: 2 }}>
        {cycles.map((cycle, index) => (
          <Paper
            key={cycle.cycleNumber}
            elevation={0}
            sx={{
              mb: 2,
              borderRadius: 2,
              overflow: 'hidden',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            {/* Cycle Header */}
            <Box
              sx={{
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: expanded === `cycle-${cycle.cycleNumber}` ? 
                  alpha(theme.palette.primary.main, 0.05) : 'transparent',
                cursor: 'pointer'
              }}
              onClick={() => handleExpandClick(`cycle-${cycle.cycleNumber}`)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LoopIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="subtitle1" fontWeight="medium">
                  Cycle #{cycle.cycleNumber}
                </Typography>
                {cycle.completedAt && (
                  <Chip
                    size="small"
                    label="Completed"
                    color="success"
                    variant="outlined"
                    sx={{ ml: 2 }}
                  />
                )}
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                  {dayjs(cycle.startedAt).format('MMM D, YYYY')}
                </Typography>
                {expanded === `cycle-${cycle.cycleNumber}` ? 
                  <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />
                }
              </Box>
            </Box>
            
            {/* Expanded Cycle Details */}
            <Collapse in={expanded === `cycle-${cycle.cycleNumber}`}>
              <Box sx={{ p: 2, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                <Grid container spacing={2}>
                  {/* Calculate dates for steps that don't have completedAt */}
                  {(() => {
                    // Find the most recent date from completed steps to use for incomplete steps
                    let lastCompletedDate = cycle.startedAt;
                    
                    // Keep track of the last valid date for each step
                    if (cycle.detection?.completedAt) {
                      lastCompletedDate = cycle.detection.completedAt;
                    }
                    const classificationDate = cycle.classification?.completedAt || lastCompletedDate;
                    if (cycle.classification?.completedAt) {
                      lastCompletedDate = cycle.classification.completedAt;
                    }
                    const assignmentDate = cycle.assignment?.completedAt || lastCompletedDate;
                    if (cycle.assignment?.completedAt) {
                      lastCompletedDate = cycle.assignment.completedAt;
                    }
                    const remediationDate = cycle.remediation?.completedAt || lastCompletedDate;
                    if (cycle.remediation?.completedAt) {
                      lastCompletedDate = cycle.remediation.completedAt;
                    }
                    const verificationDate = cycle.verification?.completedAt || lastCompletedDate;
                    
                    return (
                      <>
                        {/* Detection Step */}
                        <Grid item xs={12} sm={6} md={4}>
                          <StepDetailCard
                            title="Detection"
                            icon={<BugReport fontSize="small" color="primary" />}
                            completed={!!cycle.detection?.completedAt}
                            date={cycle.detection?.completedAt || cycle.startedAt}
                            metrics={[
                              { label: "Vulnerabilities", value: cycle.detection?.numberVuls || 0 }
                            ]}
                          />
                        </Grid>
                        
                        {/* Classification Step */}
                        <Grid item xs={12} sm={6} md={4}>
                          <StepDetailCard
                            title="Classification"
                            icon={<Security fontSize="small" color="info" />}
                            completed={!!cycle.classification?.completedAt}
                            date={classificationDate}
                            metrics={[
                              { label: "Threats", value: cycle.classification?.numberThreats || 0 }
                            ]}
                          />
                        </Grid>
                        
                        {/* Assignment Step */}
                        <Grid item xs={12} sm={6} md={4}>
                          <StepDetailCard
                            title="Assignment"
                            icon={<AssignmentIcon fontSize="small" color="secondary" />}
                            completed={!!cycle.assignment?.completedAt}
                            date={assignmentDate}
                            metrics={[
                              { label: "Assigned", value: cycle.assignment?.numberTicketsAssigned || 0 },
                              { label: "Unassigned", value: cycle.assignment?.numberTicketsNotAssigned || 0 }
                            ]}
                          />
                        </Grid>
                        
                        {/* Remediation Step */}
                        <Grid item xs={12} sm={6} md={4}>
                          <StepDetailCard
                            title="Remediation"
                            icon={<BuildIcon fontSize="small" color="warning" />}
                            completed={!!cycle.remediation?.completedAt}
                            date={remediationDate}
                            metrics={[
                              { label: "Submitted", value: cycle.remediation?.numberTicketsSubmitted || 0 },
                              { label: "Not Submitted", value: cycle.remediation?.numberTicketsNotSubmitted || 0 }
                            ]}
                          />
                        </Grid>
                        
                        {/* Verification Step */}
                        <Grid item xs={12} sm={6} md={4}>
                          <StepDetailCard
                            title="Verification"
                            icon={<VerifiedUser fontSize="small" color="success" />}
                            completed={!!cycle.verification?.completedAt}
                            date={verificationDate}
                            metrics={[
                              { label: "Resolved", value: cycle.verification?.numberTicketsResolved || 0 },
                              { label: "Returned", value: cycle.verification?.numberTicketsReturnedToProcessing || 0 }
                            ]}
                            notes={cycle.verification?.notes}
                          />
                        </Grid>
                        
                        {/* Cycle Summary */}
                        <Grid item xs={12} sm={6} md={4}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              height: '100%',
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.background.paper, 0.7)
                            }}
                          >
                            <Typography variant="subtitle2" gutterBottom>
                              Cycle Summary
                            </Typography>
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="caption" color="text.secondary">Started:</Typography>
                              <Typography variant="body2">
                                {dayjs(cycle.startedAt).format('MMM D, YYYY')}
                              </Typography>
                            </Box>
                            {cycle.completedAt && (
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="caption" color="text.secondary">Completed:</Typography>
                                <Typography variant="body2">
                                  {dayjs(cycle.completedAt).format('MMM D, YYYY')}
                                </Typography>
                              </Box>
                            )}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="caption" color="text.secondary">Duration:</Typography>
                              <Typography variant="body2">
                                {cycle.completedAt ?
                                  dayjs(cycle.completedAt).from(dayjs(cycle.startedAt), true) :
                                  'In progress'
                                }
                              </Typography>
                            </Box>
                          </Paper>
                        </Grid>
                      </>
                    );
                  })()}
                </Grid>
              </Box>
            </Collapse>
          </Paper>
        ))}
      </Box>
    </>
  );
}

// Step Detail Card component for each workflow step in the history
interface StepDetailCardProps {
  title: string;
  icon: React.ReactNode;
  completed: boolean;
  date?: string | Date;
  metrics: Array<{ label: string; value: number }>;
  notes?: string;
}

function StepDetailCard({ title, icon, completed, date, metrics, notes }: StepDetailCardProps) {
  const theme = useTheme();
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        height: '100%',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.background.paper, 0.7)
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
          {icon}
          <Box component="span" sx={{ ml: 1 }}>{title}</Box>
        </Typography>
      </Box>
      
      <Divider sx={{ my: 1 }} />
      
      {metrics.map((metric, idx) => (
        <Box 
          key={idx} 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            mb: 0.5 
          }}
        >
          <Typography variant="caption" color="text.secondary">{metric.label}:</Typography>
          <Typography variant="body2">{metric.value}</Typography>
        </Box>
      ))}
      
      {notes && (
        <Box sx={{ mt: 1, pt: 1, borderTop: `1px dashed ${theme.palette.divider}` }}>
          <Typography variant="caption" color="text.secondary">Notes:</Typography>
          <Typography variant="body2">{notes}</Typography>
        </Box>
      )}
      
      <Box sx={{ mt: 1, pt: 1, borderTop: `1px dashed ${theme.palette.divider}` }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
          <ScheduleIcon fontSize="inherit" sx={{ mr: 0.5 }} />
          {date ? dayjs(date).format('MMM D, YYYY') : "Date not available"}
        </Typography>
      </Box>
    </Paper>
  );
}