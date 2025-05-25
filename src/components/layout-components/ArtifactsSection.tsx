import React from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  useTheme, 
  alpha, 
  Chip, 
  Button,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { 
  ArticleOutlined, 
  BugReport, 
  Security,
  NavigateNext,
  Code,
  ContentPaste,
  GridView,
  LibraryBooks 
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useArtifactsQuery } from '~/hooks/fetching/artifact/query';
import { Docker } from '~/icons/Icons';

interface ArtifactsSectionProps {
  currentProject: string;
}

const ArtifactsSection = ({ currentProject }: ArtifactsSectionProps) => {
  const theme = useTheme();
  const artifactsQuery = useArtifactsQuery(currentProject);
  
  if (artifactsQuery.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (artifactsQuery.isError) {
    return (
      <Box sx={{ 
        p: 3, 
        textAlign: 'center',
        bgcolor: alpha(theme.palette.error.main, 0.05),
        borderRadius: 2,
        border: `1px dashed ${alpha(theme.palette.error.main, 0.3)}`
      }}>
        <Typography color="error">
          Error loading artifacts
        </Typography>
      </Box>
    );
  }
  
  const artifacts = artifactsQuery.data?.data || [];
  
  if (artifacts.length === 0) {
    return (
      <Box sx={{ 
        p: 4, 
        textAlign: 'center',
        bgcolor: alpha(theme.palette.primary.main, 0.03),
        borderRadius: 2,
        border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`
      }}>
        <ArticleOutlined sx={{ fontSize: 40, color: alpha(theme.palette.primary.main, 0.3), mb: 1 }} />
        <Typography variant="body1" color="text.secondary" gutterBottom>
          No artifacts found for this project
        </Typography>
        <Button 
          component={RouterLink}
          to={`/${encodeURIComponent(currentProject)}/phase`}
          variant="outlined" 
          size="small"
          sx={{ mt: 1 }}
        >
          Go to Phases to Add Artifacts
        </Button>
      </Box>
    );
  }
  
  // Helper function to get the icon for each artifact type
  const getArtifactTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Docker />;
      case 'log':
        return <ContentPaste />;
      case 'source code':
        return <Code />;
      case 'executable':
        return <GridView />;
      case 'library':
        return <LibraryBooks />;
      default:
        return <ArticleOutlined />;
    }
  };
  
  // Get the color for each artifact type
  const getArtifactTypeColor = (type: string) => {
    switch (type) {
      case 'image':
        return theme.palette.info.main;
      case 'source code':
        return theme.palette.success.main;
      case 'log':
        return theme.palette.warning.main;
      case 'executable':
        return theme.palette.error.main;
      case 'library':
        return theme.palette.secondary.main;
      default:
        return theme.palette.primary.main;
    }
  };
  
  return (
    <Grid container spacing={2}>
      {artifacts.map((artifact) => (
        <Grid item xs={12} sm={6} md={4} key={artifact._id}>
          <Card 
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              },
              position: 'relative',
              overflow: 'hidden'
            }}
          >            {artifact.isScanning && (
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                right: 0, 
                bgcolor: alpha(theme.palette.warning.main, 0.9),
                color: 'white',
                px: 1,
                py: 0.5,
                borderBottomLeftRadius: 8,
                fontSize: '0.7rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}>
                <CircularProgress size={12} color="inherit" />
                SCANNING
              </Box>
            )}
            
            {artifact.state === "invalid" && (
              <Box sx={{ 
                position: 'absolute', 
                top: artifact.isScanning ? 32 : 0, 
                right: 0, 
                bgcolor: alpha(theme.palette.error.main, 0.9),
                color: 'white',
                px: 1,
                py: 0.5,
                borderBottomLeftRadius: 8,
                fontSize: '0.7rem',
                fontWeight: 'bold',
              }}>
                INVALID
              </Box>
            )}
            
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: '8px',
                      bgcolor: alpha(getArtifactTypeColor(artifact.type), 0.1),
                      color: getArtifactTypeColor(artifact.type),
                      mr: 1.5
                    }}
                  >
                    {getArtifactTypeIcon(artifact.type)}
                  </Box>
                  <Box>
                    <Typography variant="h6" noWrap sx={{ maxWidth: 200 }}>
                      {artifact.name}
                    </Typography>
                    <Chip 
                      label={artifact.type}
                      size="small"
                      sx={{ 
                        bgcolor: alpha(getArtifactTypeColor(artifact.type), 0.1),
                        color: getArtifactTypeColor(artifact.type),
                        fontWeight: 'medium'
                      }}
                    />
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {artifact.version && (
                  <Tooltip title="Version">
                    <Chip 
                      label={`v${artifact.version}`} 
                      size="small" 
                      variant="outlined" 
                    />
                  </Tooltip>
                )}
              </Box>
              
              <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Tooltip title="Vulnerabilities">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <BugReport fontSize="small" color="error" />
                      <Typography variant="body2">
                        {artifact.vulnerabilityList?.length || 0} Vulnerabilities
                      </Typography>
                    </Box>
                  </Tooltip>
                  
                  <Tooltip title="Threats">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <Security fontSize="small" color="primary" />
                      <Typography variant="body2">
                        {artifact.threatList?.length || 0} Threats
                      </Typography>
                    </Box>
                  </Tooltip>
                </Box>
                
                <Button
                  component={RouterLink}
                  to={`/${encodeURIComponent(currentProject)}/artifact/${artifact._id}`}
                  endIcon={<NavigateNext />}
                  size="small"
                >
                  Details
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ArtifactsSection;