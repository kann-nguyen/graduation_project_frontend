import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Toolbar, 
  Paper, 
  Typography,
  Divider,
  useTheme,
  alpha,
  Card,
  Button,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  CircularProgress,
  Tooltip,
  IconButton
} from "@mui/material";
import { 
  ShieldOutlined, 
  Search, 
  FilterList, 
  Sort, 
  MoreVert,
  Security,
  Add,
  NavigateBefore,
  NavigateNext,
  FirstPage,
  LastPage,
  Clear
} from "@mui/icons-material";
import { useParams, Link as RouterLink } from "react-router-dom";
import { useThreatsQuery } from "~/hooks/fetching/threat/query";
import { useProjectInfoQuery } from "~/hooks/fetching/project/query";
import { Threat } from "~/hooks/fetching/threat";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// Extend dayjs with relative time
dayjs.extend(relativeTime);

// Threat type list for filtering
const threatTypes = [
  'All Types',
  'Spoofing',
  'Tampering',
  'Repudiation',
  'Information Disclosure',
  'Denial of Service',
  'Elevation of Privilege'
];

export default function ThreatsPage() {
  const { currentProject } = useParams();
  const threatsQuery = useThreatsQuery();
  const projectInfoQuery = useProjectInfoQuery(currentProject || '');
  const projectInfo = projectInfoQuery.data?.data;
  const theme = useTheme();
  
  const [threats, setThreats] = useState<Threat[]>([]);
  const [filteredThreats, setFilteredThreats] = useState<Threat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [sortBy, setSortBy] = useState('name');
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Initialize threats from query
  useEffect(() => {
    if (threatsQuery.data?.data) {
      setThreats(threatsQuery.data.data);
      setFilteredThreats(threatsQuery.data.data);
      setIsLoading(false);
    }
  }, [threatsQuery.data]);

  // Apply filters and search
  useEffect(() => {
    if (!threats || threats.length === 0) return;

    let result = [...threats];

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(threat => 
        threat.name.toLowerCase().includes(query) || 
        threat.description.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (typeFilter !== 'All Types') {
      result = result.filter(threat => threat.type === typeFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'score':
          return b.score.total - a.score.total;
        default:
          return 0;
      }
    });

    setFilteredThreats(result);
  }, [threats, searchQuery, typeFilter, sortBy]);

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
        return { icon: '🛑', color: theme.palette.error.light };
      case 'Elevation of Privilege': 
        return { icon: '⬆️', color: theme.palette.warning.dark };
      default:
        return { icon: '❓', color: theme.palette.grey[500] };
    }
  };

  // Get score severity info
  const getScoreSeverity = (score: number) => {
    if (score >= 4) return { label: 'Critical', color: theme.palette.error.main };
    if (score >= 3) return { label: 'High', color: theme.palette.warning.main };
    if (score >= 2) return { label: 'Medium', color: theme.palette.info.main };
    return { label: 'Low', color: theme.palette.success.main };
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('All Types');
  };

  // Check if filters are active
  const hasActiveFilters = searchQuery || typeFilter !== 'All Types';

  // Get paginated threats
  const paginatedThreats = filteredThreats.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ 
      flexGrow: 1, 
      minHeight: "100vh", 
      width: "100%", 
      overflow: "auto",
      bgcolor: theme.palette.mode === 'dark' ? 'background.default' : alpha(theme.palette.primary.light, 0.04),
    }}>
      <Toolbar />
      <Container sx={{ py: 3 }} maxWidth="xl">
        {/* Page Header */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 2, 
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box 
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: { xs: 80, md: 150 },
              height: '100%',
              opacity: 0.05,
              display: { xs: 'none', md: 'block' }
            }}
          >
            <ShieldOutlined sx={{ fontSize: 180, position: 'absolute', top: '50%', right: -20, transform: 'translateY(-50%)' }} />
          </Box>
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h4" fontWeight="bold">
              Security Threats
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
              Manage and monitor security threats for {projectInfo?.name || "this project"}
            </Typography>
          </Box>
        </Paper>

        {/* Threats Management Card */}
        <Card sx={{ width: '100%', mb: 4, overflow: 'hidden', boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
          

          {/* Search and Filters */}
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  placeholder="Search threats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="type-filter-label">Threat Type</InputLabel>
                  <Select
                    labelId="type-filter-label"
                    value={typeFilter}
                    label="Threat Type"
                    onChange={(e) => setTypeFilter(e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <FilterList fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    {threatTypes.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="sort-by-label">Sort By</InputLabel>
                  <Select
                    labelId="sort-by-label"
                    value={sortBy}
                    label="Sort By"
                    onChange={(e) => setSortBy(e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <Sort fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="type">Type</MenuItem>
                    <MenuItem value="score">Risk Score</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={1} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                {hasActiveFilters && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Clear />}
                    onClick={handleResetFilters}
                    sx={{ height: '40px' }}
                  >
                    Clear
                  </Button>
                )}
              </Grid>
            </Grid>
          </Box>
          
          {/* Threats List */}
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 10 }}>
              <CircularProgress />
            </Box>
          ) : paginatedThreats.length > 0 ? (
            <List disablePadding>
              {paginatedThreats.map((threat, index) => {
                const typeInfo = getThreatTypeInfo(threat.type);
                const severityInfo = getScoreSeverity(threat.score.total);
                
                return (
                  <React.Fragment key={threat._id}>
                    <ListItem
                      sx={{ 
                        px: 3, 
                        py: 2,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.05)
                        },
                        cursor: 'pointer'
                      }}
                      component={RouterLink}
                      to={`/${encodeURIComponent(currentProject || '')}/threats/${threat._id}`}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: alpha(typeInfo.color, 0.1),
                            color: typeInfo.color
                          }}
                        >
                          {typeInfo.icon}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body1" fontWeight="medium">
                            {threat.name || 'Unnamed Threat'}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: '90%' }}>
                              {threat.description || 'No description'}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, flexWrap: 'wrap', gap: 1 }}>
                              <Chip
                                label={threat.type}
                                size="small"
                                sx={{
                                  bgcolor: alpha(typeInfo.color, 0.1),
                                  color: typeInfo.color,
                                  fontWeight: 'medium'
                                }}
                              />
                              <Chip
                                label={`Risk Score: ${threat.score.total.toFixed(1)}`}
                                size="small"
                                sx={{
                                  bgcolor: alpha(severityInfo.color, 0.1),
                                  color: severityInfo.color,
                                  fontWeight: 'medium'
                                }}
                              />
                            </Box>
                          </Box>
                        }
                      />
                      <IconButton>
                        <MoreVert />
                      </IconButton>
                    </ListItem>
                    {index < paginatedThreats.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>
          ) : (
            <Box sx={{ 
              py: 10, 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary'
            }}>
              <ShieldOutlined sx={{ fontSize: 60, color: alpha(theme.palette.error.main, 0.3), mb: 2 }} />
              <Typography variant="h6" gutterBottom>No threats found</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mx: 'auto', mb: 3 }}>
                {hasActiveFilters ? 
                  'No threats match your search criteria. Try adjusting your filters or search query.' :
                  'No threats have been identified for this project yet.'}
              </Typography>
              {hasActiveFilters && (
                <Button 
                  variant="outlined" 
                  onClick={handleResetFilters}
                >
                  Clear Filters
                </Button>
              )}
            </Box>
          )}
          
          {/* Pagination */}
          {paginatedThreats.length > 0 && (
            <Box 
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 2,
                py: 1.5,
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" mr={2}>
                  Rows per page:
                </Typography>
                <FormControl size="small" variant="outlined" sx={{ minWidth: 80 }}>
                  <Select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value as string, 10));
                      setPage(0);
                    }}
                    sx={{ 
                      height: '32px',
                      '& .MuiSelect-select': { py: 0.5 } 
                    }}
                  >
                    {[5, 10, 25, 50].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" mr={2}>
                  {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, filteredThreats.length)} of {filteredThreats.length}
                </Typography>
                <Box sx={{ display: 'flex' }}>
                  <Tooltip title="First page">
                    <span>
                      <IconButton 
                        size="small"
                        onClick={() => setPage(0)}
                        disabled={page === 0}
                        sx={{ color: 'primary.main' }}
                      >
                        <FirstPage fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Previous page">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 0}
                        sx={{ color: 'primary.main' }}
                      >
                        <NavigateBefore fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Next page">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => setPage(page + 1)}
                        disabled={page >= Math.ceil(filteredThreats.length / rowsPerPage) - 1}
                        sx={{ color: 'primary.main' }}
                      >
                        <NavigateNext fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Last page">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => setPage(Math.max(0, Math.ceil(filteredThreats.length / rowsPerPage) - 1))}
                        disabled={page >= Math.ceil(filteredThreats.length / rowsPerPage) - 1}
                        sx={{ color: 'primary.main' }}
                      >
                        <LastPage fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          )}
        </Card>

        {/* Threat Types Statistics */}
        {filteredThreats.length > 0 && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.paper'
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Threat Types Distribution
            </Typography>
            <Grid container spacing={2}>
              {threatTypes.slice(1).map(type => {
                const typeCount = threats.filter(t => t.type === type).length;
                const typeInfo = getThreatTypeInfo(type);
                
                return (
                  <Grid item xs={6} sm={4} md={2} key={type}>
                    <Paper elevation={0} sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      bgcolor: alpha(typeInfo.color, 0.05),
                      border: `1px solid ${alpha(typeInfo.color, 0.1)}`
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar sx={{ 
                          width: 24, 
                          height: 24, 
                          fontSize: '0.8rem', 
                          bgcolor: alpha(typeInfo.color, 0.2),
                          color: typeInfo.color,
                          mr: 1
                        }}>
                          {typeInfo.icon}
                        </Avatar>
                        <Typography variant="body2" noWrap>
                          {type}
                        </Typography>
                      </Box>
                      <Typography variant="h5" fontWeight="bold" sx={{ color: typeInfo.color }}>
                        {typeCount}
                      </Typography>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        )}
      </Container>
    </Box>
  );
}