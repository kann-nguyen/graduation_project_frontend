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
} from "@mui/icons-material";
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
} from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useParams, useNavigate } from "react-router-dom";
import { useArtifactQuery } from "~/hooks/fetching/artifact/query";
import { useThreatQuery } from "~/hooks/fetching/threat/query";
import { useState, useMemo, useEffect } from "react";
import { Artifact, Vulnerability } from "~/hooks/fetching/artifact";
import UpdateArtifactDialog from "~/components/dialogs/UpdateArtifactDialog";
import { useSearchParams } from "react-router-dom";
import { typeOptions } from "~/utils/threat-display";

dayjs.extend(relativeTime);

function PageHeader({ artifact }: { artifact: Artifact }) {
  const navigate = useNavigate();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const { currentProject } = useParams();
  const theme = useTheme();
  
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
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate(`/${encodeURIComponent(currentProject || '')}`)}
          sx={{ mr: 2 }}
          variant="text"
          color="inherit"
        >
          Back to phase
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
          label={artifact.type.charAt(0).toUpperCase() + artifact.type.slice(1)}
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

function VulnerabilitiesSummary({ vulnerabilities }: { vulnerabilities: Vulnerability[] }) {
  const theme = useTheme();
  
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
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Vulnerabilities Summary
        </Typography>
        <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <VerifiedUser sx={{ fontSize: 48, color: theme.palette.success.main, mb: 2 }} />
          <Typography>No vulnerabilities detected</Typography>
        </Box>
      </Paper>
    );
  }
  
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
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Vulnerabilities Summary
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              bgcolor: alpha(theme.palette.error.main, 0.1),
              borderLeft: `4px solid ${theme.palette.error.main}`,
              borderRadius: 1,
              height: '100%'
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              Critical
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="error">
              {counts.critical}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              bgcolor: alpha(theme.palette.warning.main, 0.1),
              borderLeft: `4px solid ${theme.palette.warning.main}`,
              borderRadius: 1,
              height: '100%'
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              High
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="warning.main">
              {counts.high}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              bgcolor: alpha(theme.palette.info.main, 0.1),
              borderLeft: `4px solid ${theme.palette.info.main}`,
              borderRadius: 1,
              height: '100%'
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              Medium
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="info.main">
              {counts.medium}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              bgcolor: alpha(theme.palette.success.main, 0.1),
              borderLeft: `4px solid ${theme.palette.success.main}`,
              borderRadius: 1,
              height: '100%'
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              Low
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {counts.low}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              bgcolor: alpha(theme.palette.grey[400], 0.1),
              borderLeft: `4px solid ${theme.palette.grey[400]}`,
              borderRadius: 1,
              height: '100%'
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              Negligible
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: theme.palette.grey[400] }}>
              {counts.negligible}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Overall Risk Assessment
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ width: '100%', mr: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={100} 
              sx={{ 
                height: 10, 
                borderRadius: 5,
                background: `linear-gradient(to right, ${theme.palette.success.main} 0%, ${theme.palette.info.main} 25%, ${theme.palette.warning.main} 60%, ${theme.palette.error.main} 100%)`,
                '& .MuiLinearProgress-bar': {
                  display: 'none'
                }
              }}
            />
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          <Typography variant="body1" sx={{ mr: 1 }}>
            Total Vulnerabilities:
          </Typography>
          <Chip 
            label={total} 
            color={
              counts.critical > 0 ? 'error' : 
              counts.high > 0 ? 'warning' : 
              counts.medium > 0 ? 'info' : 'success'
            } 
            variant="filled" 
            size="small"
          />
        </Box>
      </Box>
    </Paper>
  );
}

function ThreatSummary({ threatList }: { threatList: (string | { _id: string })[] }) {
  const theme = useTheme();
  
  // Track counts by threat type
  const [threatTypeCounts, setThreatTypeCounts] = useState<{[key: string]: number}>({
    'Spoofing': 0,
    'Tampering': 0,
    'Repudiation': 0,
    'Information Disclosure': 0,
    'Denial of Service': 0,
    'Elevation of Privilege': 0,
    'Unknown': 0
  });
  
  // Track status counts for the overall badge
  const [threatStatusCounts, setThreatStatusCounts] = useState<{[key: string]: number}>({
    'Non mitigated': 0,
    'Partially mitigated': 0,
    'Fully mitigated': 0,
    'Unknown': 0,
  });
  
  // Add debug state variables
  const [isLoading, setIsLoading] = useState(true);
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

  // Create a custom fetch function that doesn't use hooks
  const fetchThreatData = async (threatId: string) => {
    try {
      // Try multiple possible API endpoints
      const possibleEndpoints = [
        `/api/threats/${threatId}`,
        `/threats/${threatId}`,
        `/api/threat/${threatId}`,
        `/threat/${threatId}`
      ];
      
      let response;
      let responseText = '';
      let endpoint = '';
      
      for (const apiEndpoint of possibleEndpoints) {
        try {
          console.log(`Trying to fetch threat data from: ${apiEndpoint}`);
          response = await fetch(apiEndpoint);
          endpoint = apiEndpoint;
          responseText = await response.text(); // Get text first to inspect
          
          if (response.ok) {
            try {
              // Try to parse as JSON
              const jsonData = JSON.parse(responseText);
              console.log(`Success with endpoint ${apiEndpoint}`);
              return jsonData;
            } catch (e) {
              console.error(`Response is not valid JSON: ${responseText.substring(0, 100)}...`);
              continue; // Try next endpoint
            }
          }
        } catch (err) {
          console.error(`Error with endpoint ${apiEndpoint}:`, err);
        }
      }
      
      // If we reach here, all endpoints failed
      console.error(`All API endpoints failed. Last response (${endpoint}):`, responseText.substring(0, 200));
      throw new Error(`Could not fetch threat data: ${responseText.substring(0, 100)}`);
    } catch (error) {
      console.error(`Error fetching threat ${threatId}:`, error);
      throw error;
    }
  };
  
  // Fetch all threat data to display in the summary
  useEffect(() => {
    const fetchThreats = async () => {
      if (!threatList?.length) {
        setIsLoading(false);
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
      
      const statusCounts = {
        'Non mitigated': 0,
        'Partially mitigated': 0,
        'Fully mitigated': 0,
        'Unknown': 0,
      };
      
      let processedCount = 0;
      let successCount = 0;
      let errorCount = 0;
      let threatSamples: any[] = [];
      let lastError = null;
      
      const maxThreatsToProcess = Math.min(50, threatList.length);
      
      for (let i = 0; i < maxThreatsToProcess; i++) {
        const threatItem = threatList[i];
        processedCount++;
        
        try {
          const threatIdValue = typeof threatItem === 'string' ? threatItem : (threatItem as { _id: string })._id;
          
          const threatData = await fetchThreatData(threatIdValue);
          const threat = threatData.data;
          
          if (!threat) {
            errorCount++;
            continue;
          }
          
          successCount++;
          
          // Store a few samples for debug display
          if (threatSamples.length < 3) {
            threatSamples.push({
              id: threat._id,
              name: threat.name,
              type: threat.type,
              status: threat.status
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
          
          // Also track status for the overall badge
          if (threat.status) {
            if (threat.status in statusCounts) {
              if (threat.status in statusCounts) {
                statusCounts[threat.status as keyof typeof statusCounts]++;
              } else {
                statusCounts['Unknown']++;
              }
            } else {
              statusCounts['Unknown']++;
            }
          } else {
            statusCounts['Unknown']++;
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
      
      // Final update of all state
      setThreatTypeCounts(typeCounts);
      setThreatStatusCounts(statusCounts);
      setIsLoading(false);
      setDebugInfo({
        processedCount,
        successCount,
        errorCount,
        threatSamples,
        lastError
      });
    };
    
    fetchThreats();
  }, [threatList]);
  
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
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Threats Summary
        </Typography>
        <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Security sx={{ fontSize: 48, color: theme.palette.grey[400], mb: 2 }} />
          <Typography>No threats associated with this artifact</Typography>
        </Box>
      </Paper>
    );
  }

  // Filter to only show types with counts > 0
  const threatTypesWithCounts = Object.entries(threatTypeCounts)
    .filter(([type, count]) => count > 0 && type !== 'Unknown')
    .sort(([_, countA], [__, countB]) => countB - countA);
  
  const noThreatsFound = threatTypesWithCounts.length === 0;

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
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Threats Summary {isLoading && <CircularProgress size={16} sx={{ ml: 1, verticalAlign: 'middle' }} />}
      </Typography>
      
      {isLoading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>
            Loading threats data ({debugInfo.processedCount}/{threatList.length})...
          </Typography>
        </Box>
      ) : noThreatsFound ? (
        <Box>
          {/* Debug information */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              mb: 3, 
              bgcolor: alpha(theme.palette.warning.main, 0.1),
              border: `1px solid ${theme.palette.warning.main}`,
              borderRadius: 1 
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" color="warning.main" gutterBottom>
              Debug Information:
            </Typography>
            <Typography variant="body2">
              - Expected Threats: {threatList.length}
            </Typography>
            <Typography variant="body2">
              - Processed: {debugInfo.processedCount}
            </Typography>
            <Typography variant="body2">
              - Success: {debugInfo.successCount}
            </Typography>
            <Typography variant="body2">
              - Errors: {debugInfo.errorCount}
            </Typography>
            {debugInfo.lastError && (
              <Typography variant="body2" color="error">
                - Last Error: {debugInfo.lastError}
              </Typography>
            )}
            {debugInfo.threatSamples.length > 0 && (
              <>
                <Typography variant="body2" fontWeight="medium" sx={{ mt: 1 }}>
                  Sample threats:
                </Typography>
                {debugInfo.threatSamples.map((sample, idx) => (
                  <Box key={idx} sx={{ mt: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                    <Typography variant="caption" display="block">
                      ID: {sample.id}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Name: {sample.name}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Type: {sample.type || 'Not set'}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Status: {sample.status || 'Not set'}
                    </Typography>
                  </Box>
                ))}
              </>
            )}
          </Paper>
          
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Security sx={{ fontSize: 48, color: theme.palette.warning.main, mb: 2 }} />
            <Typography color="warning.main" variant="h6" gutterBottom>
              No threat type information found
            </Typography>
            <Typography color="text.secondary">
              {threatList.length} threats exist, but could not extract proper STRIDE type information from them.
            </Typography>
          </Box>
        </Box>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {threatTypesWithCounts.map(([type, count]) => {
              const { icon, color } = getThreatTypeInfo(type);
              return (
                <Grid item xs={6} sm={4} md={4} key={type}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      bgcolor: alpha(color, 0.1),
                      borderLeft: `4px solid ${color}`,
                      borderRadius: 1,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" sx={{ mr: 1 }}>{icon}</Typography>
                      <Typography variant="subtitle2" color="text.secondary" noWrap>
                        {type}
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ color }}>
                      {count}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {count === 1 ? '1 threat' : `${count} threats`}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
          
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            <Typography variant="body1" sx={{ mr: 1 }}>
              Total Threats:
            </Typography>
            <Chip 
              label={threatList.length} 
              color={ 
                threatStatusCounts['Non mitigated'] > 0 ? 'error' : 
                threatStatusCounts['Partially mitigated'] > 0 ? 'warning' : 'success'
              } 
              variant="filled" 
              size="small"
            />
            
            <Box sx={{ flexGrow: 1 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Status:
              </Typography>
              {threatStatusCounts['Non mitigated'] > 0 && (
                <Chip 
                  size="small" 
                  label={`${threatStatusCounts['Non mitigated']} Non mitigated`} 
                  color="error"
                  variant="outlined"
                />
              )}
              {threatStatusCounts['Partially mitigated'] > 0 && (
                <Chip 
                  size="small" 
                  label={`${threatStatusCounts['Partially mitigated']} Partially mitigated`} 
                  color="warning"
                  variant="outlined"
                />
              )}
              {threatStatusCounts['Fully mitigated'] > 0 && (
                <Chip 
                  size="small" 
                  label={`${threatStatusCounts['Fully mitigated']} Fully mitigated`} 
                  color="success"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        </>
      )}
    </Paper>
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
  const [threats, setThreats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch all threat data
  useEffect(() => {
    const fetchThreats = async () => {
      if (!threatList?.length) {
        setLoading(false);
        return;
      }
      
      const fetchedThreats = [];
      
      for (const threatIdItem of threatList) {
        // Handle both string IDs and object references with _id property
        const threatId = typeof threatIdItem === 'string' ? threatIdItem : (threatIdItem as { _id: string })._id;
        
        try {
          const threatQuery = await useThreatQuery(threatId).refetch();
          const threat = threatQuery.data?.data;
          if (threat) {
            fetchedThreats.push(threat);
          }
        } catch (error) {
          console.error(`Error fetching threat ${threatId}:`, error);
        }
      }
      
      setThreats(fetchedThreats);
      setLoading(false);
    };
    
    fetchThreats();
  }, [threatList]);
  
  const filteredThreats = useMemo(() => {
    return threats.filter(threat => 
      searchTerm === '' || 
      threat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      threat.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      threat.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [threats, searchTerm]);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Non mitigated': return theme.palette.error.main;
      case 'Partially mitigated': return theme.palette.warning.main;
      case 'Fully mitigated': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };
  
  if (loading) {
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
        />
      </Box>
      
      {filteredThreats.length > 0 ? (
        <Grid container spacing={2}>
          {filteredThreats.map(threat => (
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
                  <Security sx={{ color: getStatusColor(threat.status), mr: 1.5 }} />
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
                    label={threat.status}
                    sx={{ 
                      bgcolor: getStatusColor(threat.status),
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
                
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="body2">
                    {threat.description}
                  </Typography>
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="outlined" 
                      size="small"
                      component={Link}
                      href={`/threats?threatId=${threat._id}`}
                      sx={{ textDecoration: 'none' }}
                    >
                      View Threat Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
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
          <Grid item xs={12} lg={8}>
            <Stack spacing={3}>
              {/* Vulnerability Summary */}
              <VulnerabilitiesSummary vulnerabilities={artifact.vulnerabilityList || []} />
              
              {/* Threat Summary */}
              <ThreatSummary threatList={artifact.threatList.map(threat => 
                typeof threat === 'string' ? threat : threat._id
              )} />
              
              {/* Action buttons for view detailed lists */}
              <Grid container spacing={2}>
                {hasVulnerabilities && (
                  <Grid item xs={12} sm={6}>
                    <Button 
                      fullWidth
                      variant="outlined" 
                      startIcon={<BugReport />}
                      size="large"
                      onClick={() => setViewVulnDialogOpen(true)}
                    >
                      View All Vulnerabilities ({artifact.vulnerabilityList?.length})
                    </Button>
                  </Grid>
                )}
                
                {hasThreats && (
                  <Grid item xs={12} sm={6}>
                    <Button 
                      fullWidth
                      variant="outlined" 
                      startIcon={<Security />}
                      size="large" 
                      onClick={() => setViewThreatsDialogOpen(true)}
                    >
                      View All Threats ({artifact.threatList?.length})
                    </Button>
                  </Grid>
                )}
              </Grid>
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
            threatList={artifact.threatList.map(threat => 
              typeof threat === 'string' ? threat : threat._id
            )} 
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}