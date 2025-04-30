import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Button, 
  Container,
  alpha,
  Grid,
  Fade
} from '@mui/material';
import {
  ArrowBack
} from '@mui/icons-material';
import { getThreat, getDetailedThreatInfo, getSuggestedFixes } from '~/hooks/fetching/threat/axios';
import { Threat } from '~/hooks/fetching/threat';
import { useTheme } from '@mui/material/styles';
import { 
  ThreatPageHeader, 
  ThreatScoreCard, 
  ThreatContextCard,
  VulnerabilityDetailsCard,
  ThreatDescriptionCard,
  SuggestFixCard,
  SuggestedFixesDialog
} from '~/components/threat/ThreatDetailComponents';

export default function ThreatDetail() {
  const { threatId } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const [threat, setThreat] = useState<Threat | null>(null);
  const [detailedInfo, setDetailedInfo] = useState<any>(null);
  const [suggestedFixes, setSuggestedFixes] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [openFixDialog, setOpenFixDialog] = useState(false);

  // Fetch basic threat info and detailed info on page load
  useEffect(() => {
    const fetchThreatData = async () => {
      try {
        setIsLoading(true);
        // Get basic threat info
        const threatResponse = await getThreat(threatId);
        setThreat(threatResponse.data);

        // Get detailed threat information
        const detailedResponse = await getDetailedThreatInfo(threatId);
        setDetailedInfo(detailedResponse.data);
        
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreatData();
  }, [threatId]);

  // Function to handle getting suggested fixes
  const handleGetSuggestedFixes = async () => {
    try {
      const response = await getSuggestedFixes(threatId);
      setSuggestedFixes(response.data);
      setOpenFixDialog(true);
    } catch (err) {
      console.error('Error getting suggested fixes:', err);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={40} thickness={4} />
        <Typography variant="h6" color="text.secondary">
          Loading threat information...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        gap: 3,
        p: 4,
        textAlign: 'center'
      }}>
        <Typography variant="h5" color="error" gutterBottom>
          Error loading threat information
        </Typography>
        <Typography color="text.secondary" paragraph>
          {error.message}
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          size="large"
        >
          Go back
        </Button>
      </Box>
    );
  }

  if (!threat || !detailedInfo) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        gap: 3,
        p: 4,
        textAlign: 'center'
      }}>
        <Typography variant="h5" color="error" gutterBottom>
          Threat information not available
        </Typography>
        <Typography color="text.secondary" paragraph>
          The requested threat data could not be found or is incomplete.
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          size="large"
        >
          Go back
        </Button>
      </Box>
    );
  }

  return (
    <Fade in={true} timeout={300}>
      <Box 
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          bgcolor: theme.palette.mode === 'dark' ? 'background.default' : alpha(theme.palette.primary.light, 0.02),
          pb: 6
        }}
      >
        <Container maxWidth="xl">
          {/* Header with threat name and basic info */}
          <ThreatPageHeader 
            threat={threat} 
            onSuggestFix={handleGetSuggestedFixes}
          />
          
          {/* Main content area */}
          <Grid container spacing={3}>
            {/* Left column - Primary content */}
            <Grid item xs={12} lg={8}>
              <ThreatScoreCard threat={threat} detailedInfo={detailedInfo} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <ThreatContextCard detailedInfo={detailedInfo} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <ThreatDescriptionCard threat={threat} detailedInfo={detailedInfo} />
                </Grid>
              </Grid>
              <VulnerabilityDetailsCard detailedInfo={detailedInfo} />
            </Grid>
            
            {/* Right column - Secondary content */}
            <Grid item xs={12} lg={4}>
              <SuggestFixCard onSuggestFix={handleGetSuggestedFixes} />
            </Grid>
          </Grid>
        </Container>
        
        {/* Dialog for showing suggested fixes */}
        <SuggestedFixesDialog
          open={openFixDialog}
          onClose={() => setOpenFixDialog(false)}
          suggestedFixes={suggestedFixes}
        />
      </Box>
    </Fade>
  );
}