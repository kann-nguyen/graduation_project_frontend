import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Paper, 
  Chip, 
  Grid, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  alpha,
  Tooltip,
  IconButton,
  LinearProgress,
  Link,
  Stack,
  Card,
  CardContent,
  Avatar,
  AvatarGroup,
  Rating,
  Badge,
  useTheme,
  Fade,
  Container
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  ArrowBack,
  Security,
  Info,
  BugReport,
  PriorityHigh,
  Engineering,
  Shield,
  Code,
  VerifiedUser,
  Memory,
  KeyboardArrowRight,
  Check,
  Close,
  QuestionMark,
  Block,
  GppBad,
  GppGood,
  ContactSupport,
  Flare,
  BarChart,
  KeyboardDoubleArrowUp,
  AccessTime,
  Dangerous,
  ErrorOutline,
  Warning,
  Grade,
  Tune,
  Visibility,
  Speed
} from '@mui/icons-material';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Threat } from '~/hooks/fetching/threat';

// PageHeader Component for ThreatDetail
export const ThreatPageHeader = ({ 
  threat, 
  onSuggestFix 
}: { 
  threat: Threat, 
  onSuggestFix: () => void 
}) => {
  const navigate = useNavigate();
  const { currentProject } = useParams();
  const location = useLocation();
  const theme = useTheme();
  
  // Extract ticketId from URL state or from search params
  const getTicketId = () => {
    // Check if ticketId is in location state
    if (location.state && location.state.ticketId) {
      return location.state.ticketId;
    }
    
    // Check URL search params as fallback
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('ticketId');
  };
  
  const ticketId = getTicketId();
  
  const handleBackClick = () => {
    if (ticketId) {
      // Navigate back to the ticket details page if we have a ticketId
      navigate(`/${encodeURIComponent(currentProject || '')}/tickets/${ticketId}`);
    } else {
      // Navigate to the threats list if no ticketId is available
      navigate(`/${encodeURIComponent(currentProject || '')}/tickets`);
    }
  };
  
  return (
    <Box sx={{ mb: 4, mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={handleBackClick}
          sx={{ mr: 2 }}
          variant="outlined"
          color="primary"
          size="medium"
        >
          {ticketId ? 'Back to ticket details' : 'Back to tickets list'}
        </Button>
        
        <Box sx={{ flexGrow: 1 }} />
      </Box>
      
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
        {threat.name || 'Unnamed Threat'}
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Chip 
          icon={<Security />} 
          label={threat.type || 'Unknown'} 
          color="primary" 
          variant="outlined"
          size="medium"
          sx={{ fontWeight: 'medium', px: 1 }}
        />
        <Chip 
          icon={<PriorityHigh />} 
          label={`Risk Score: ${threat.score?.total || 'N/A'}/5`} 
          color={
            threat.score?.total >= 4 ? 'error' :
            threat.score?.total >= 3 ? 'warning' :
            threat.score?.total >= 2 ? 'info' : 'success'
          }
          variant="outlined"
          size="medium"
          sx={{ fontWeight: 'medium', px: 1 }}
        />
      </Box>
    </Box>
  );
};

// ThreatScoreCard Component for risk assessment visualization
export const ThreatScoreCard = ({ threat, detailedInfo }: { threat: Threat, detailedInfo: any }) => {
  const theme = useTheme();
  
  // Filter out 'id' from score components if it exists
  const scoreComponents = threat.score?.details || {
    damage: 0,
    reproducibility: 0,
    exploitability: 0,
    affectedUsers: 0,
    discoverability: 0
  };

  const impactLevel = detailedInfo?.riskAssessment?.impactLevel || 'Medium';
  const likelihoodLevel = detailedInfo?.riskAssessment?.likelihoodLevel || 'Medium';
  const riskLevel = detailedInfo?.riskAssessment?.riskLevel || 'Medium';
  
  // Function to get color based on score value
  const getScoreColor = (score: number) => {
    if (score >= 4) return theme.palette.error.main;
    if (score >= 3) return theme.palette.warning.main;
    if (score >= 2) return theme.palette.info.main;
    return theme.palette.success.main;
  };
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        mb: 3,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        background: `${alpha(theme.palette.background.paper, 0.8)}`,
        backdropFilter: 'blur(20px)',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: `0px 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, mr: 2 }}>
            <BarChart />
          </Avatar>
          <Typography variant="h6" fontWeight="bold">
            Risk Assessment
          </Typography>
        </Box>
        <Chip 
          label={`Overall Score: ${threat.score?.total || 'N/A'}/5`}
          color={
            threat.score?.total >= 4 ? 'error' :
            threat.score?.total >= 3 ? 'warning' :
            threat.score?.total >= 2 ? 'info' : 'success'
          }
          sx={{ fontWeight: 'bold', px: 1 }}
          size="medium"
        />
      </Box>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3} sx={{ textAlign: 'center' }}>
          <Grid item xs={4}>
            <Box 
              sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: alpha(
                  impactLevel === 'Critical' ? theme.palette.error.main :
                  impactLevel === 'High' ? theme.palette.warning.main :
                  impactLevel === 'Medium' ? theme.palette.info.main : theme.palette.success.main, 
                  0.1
                ),
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>Impact</Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: impactLevel === 'Critical' ? 'error.main' :
                        impactLevel === 'High' ? 'warning.main' :
                        impactLevel === 'Medium' ? 'info.main' : 'success.main'
                }}
              >
                {impactLevel}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={4}>
            <Box 
              sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: alpha(
                  likelihoodLevel === 'High' ? theme.palette.warning.main :
                  likelihoodLevel === 'Medium' ? theme.palette.info.main : theme.palette.success.main, 
                  0.1
                ),
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>Likelihood</Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: likelihoodLevel === 'High' ? 'warning.main' :
                        likelihoodLevel === 'Medium' ? 'info.main' : 'success.main'
                }}
              >
                {likelihoodLevel}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={4}>
            <Box 
              sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: alpha(
                  riskLevel === 'Critical' ? theme.palette.error.main :
                  riskLevel === 'High' ? theme.palette.warning.main :
                  riskLevel === 'Medium' ? theme.palette.info.main : theme.palette.success.main, 
                  0.1
                ),
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>Risk Level</Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: riskLevel === 'Critical' ? 'error.main' :
                        riskLevel === 'High' ? 'warning.main' :
                        riskLevel === 'Medium' ? 'info.main' : 'success.main'
                }}
              >
                {riskLevel}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      <Divider sx={{ my: 3 }} />

      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 2 }}>
          DREAD Score Components
        </Typography>
        
        <Grid container spacing={2}>
          {Object.entries(scoreComponents)
            .filter(([key]) => key !== '_id' && key !== 'id')
            .map(([key, value]) => {
              const label = key.charAt(0).toUpperCase() + key.slice(1);
              const scoreColor = getScoreColor(value as number);
              
              return (
                <Grid item xs={6} sm={4} md={2.4} key={key}>
                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {label}
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {value}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(value as number) * 20} // Convert 0-5 to 0-100
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: alpha(scoreColor, 0.2),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          backgroundColor: scoreColor
                        }
                      }}
                    />
                  </Box>
                </Grid>
              );
            })}
        </Grid>
      </Box>
    </Paper>
  );
};

// ThreatContextCard Component for showing contextual information
export const ThreatContextCard = ({ detailedInfo }: { detailedInfo: any }) => {
  const theme = useTheme();
  const threatContext = detailedInfo?.threatContext;
  
  if (!threatContext) {
    return null;
  }
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        mb: 3,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        height: '100%',
        background: `${alpha(theme.palette.background.paper, 0.8)}`,
        backdropFilter: 'blur(20px)',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: `0px 4px 20px ${alpha(theme.palette.info.main, 0.1)}`,
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main, mr: 2 }}>
          <Info />
        </Avatar>
        <Typography variant="h6" fontWeight="bold">
          Context & Background
        </Typography>
      </Box>
      
      <Typography variant="body1" paragraph sx={{ mb: 3 }}>
        {threatContext.description}
      </Typography>
      
      <Grid container spacing={3}>
        {threatContext.commonAttackVectors && (
          <Grid item xs={12}>
            <Box 
              sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: alpha(theme.palette.warning.main, 0.05),
                border: `1px dashed ${alpha(theme.palette.warning.main, 0.3)}`,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 'medium', mb: 1, color: theme.palette.warning.main }}>
                Common Attack Vectors
              </Typography>
              <List dense disablePadding>
                {threatContext.commonAttackVectors.map((vector: string, index: number) => (
                  <ListItem key={index} disablePadding sx={{ pl: 0, pb: 0.5 }}>
                    <ListItemText 
                      primary={
                        <Typography variant="body2">
                          • {vector}
                        </Typography>
                      } 
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Grid>
        )}
        
        {threatContext.securityPrinciples && (
          <Grid item xs={12}>
            <Box 
              sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: alpha(theme.palette.success.main, 0.05),
                border: `1px dashed ${alpha(theme.palette.success.main, 0.3)}`,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 'medium', mb: 1, color: theme.palette.success.main }}>
                Security Principles
              </Typography>
              <List dense disablePadding>
                {threatContext.securityPrinciples.map((principle: string, index: number) => (
                  <ListItem key={index} disablePadding sx={{ pl: 0, pb: 0.5 }}>
                    <ListItemText 
                      primary={
                        <Typography variant="body2">
                          • {principle}
                        </Typography>
                      } 
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

// VulnerabilityDetailsCard Component for related vulnerability information
export const VulnerabilityDetailsCard = ({ detailedInfo }: { detailedInfo: any }) => {
  const theme = useTheme();
  const vulnerability = detailedInfo?.relatedVulnerability;
  
  if (!vulnerability) {
    return null;
  }
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        mb: 3,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        background: `${alpha(theme.palette.background.paper, 0.8)}`,
        backdropFilter: 'blur(20px)',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: `0px 4px 20px ${alpha(theme.palette.error.main, 0.1)}`,
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main, mr: 2 }}>
          <BugReport />
        </Avatar>
        <Typography variant="h6" fontWeight="bold">
          Related Vulnerability
        </Typography>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                CVE ID
              </Typography>
              <Typography variant="body1" fontWeight="medium" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), px: 1.5, py: 0.5, borderRadius: 1, display: 'inline-block' }}>
                {vulnerability.cveId || 'N/A'}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Published
              </Typography>
              <Typography variant="body1">
                {vulnerability.published || 'Unknown'}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                CVSS Score
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label={vulnerability.score || 'N/A'} 
                  color={
                    vulnerability.score >= 9 ? 'error' :
                    vulnerability.score >= 7 ? 'warning' :
                    vulnerability.score >= 4 ? 'info' : 'success'
                  }
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
                <Typography variant="body2" fontWeight="medium">
                  {vulnerability.severity || 'Unknown'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Affected Components
              </Typography>
              <Typography variant="body1">
                {vulnerability.affected || 'Not specified'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
        
      {vulnerability.cwes && vulnerability.cwes.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            CWE References
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
            {vulnerability.cwes.map((cwe: string, index: number) => (
              <Chip
                key={index}
                label={cwe}
                size="small"
                variant="outlined"
                sx={{ borderRadius: '4px' }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

// ThreatDescriptionCard Component for description and affected assets
export const ThreatDescriptionCard = ({ threat, detailedInfo }: { threat: Threat, detailedInfo: any }) => {
  const theme = useTheme();
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        mb: 3,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        height: '100%',
        background: `${alpha(theme.palette.background.paper, 0.8)}`,
        backdropFilter: 'blur(20px)',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: `0px 4px 20px ${alpha(theme.palette.warning.main, 0.1)}`,
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main, mr: 2 }}>
          <Dangerous />
        </Avatar>
        <Typography variant="h6" fontWeight="bold">
          Threat Details
        </Typography>
      </Box>
      
      <Typography variant="body1" paragraph sx={{ mb: 3 }}>
        {threat.description || 'No description available'}
      </Typography>
      
      {detailedInfo?.riskAssessment?.affectedAssets && (
        <Box 
          sx={{ 
            p: 2, 
            borderRadius: 2, 
            bgcolor: alpha(theme.palette.warning.main, 0.05),
            border: `1px dashed ${alpha(theme.palette.warning.main, 0.3)}`,
            mb: 2
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 'medium', mb: 1, color: theme.palette.warning.main }}>
            Affected Assets
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
            {detailedInfo.riskAssessment.affectedAssets.map((asset: string, index: number) => (
              <Chip
                key={index}
                label={asset}
                size="small"
                variant="outlined"
                sx={{ borderRadius: '4px' }}
              />
            ))}
          </Box>
        </Box>
      )}
      
      {detailedInfo?.riskAssessment?.potentialImpacts && (
        <Box 
          sx={{ 
            p: 2, 
            borderRadius: 2, 
            bgcolor: alpha(theme.palette.error.main, 0.05),
            border: `1px dashed ${alpha(theme.palette.error.main, 0.3)}`,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 'medium', mb: 1, color: theme.palette.error.main }}>
            Potential Impacts
          </Typography>
          <List dense disablePadding>
            {detailedInfo.riskAssessment.potentialImpacts.map((impact: string, index: number) => (
              <ListItem key={index} disablePadding sx={{ pl: 0, pb: 0.5 }}>
                <ListItemText 
                  primary={
                    <Typography variant="body2">
                      • {impact}
                    </Typography>
                  } 
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Paper>
  );
};

// SuggestFixCard Component for call-to-action
export const SuggestFixCard = ({ onSuggestFix }: { onSuggestFix: () => void }) => {
  const theme = useTheme();
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        background: `${alpha(theme.palette.background.paper, 0.8)}`,
        backdropFilter: 'blur(20px)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: `0px 4px 20px ${alpha(theme.palette.secondary.main, 0.15)}`,
          transform: 'translateY(-4px)'
        }
      }}
    >
      {/* Header Section with Gradient */}
      <Box 
        sx={{ 
          background: `linear-gradient(45deg, ${alpha(theme.palette.secondary.main, 0.8)} 30%, ${alpha(theme.palette.primary.main, 0.8)} 90%)`,
          color: '#fff',
          pt: 3,
          pb: 6,
          px: 3,
          position: 'relative',
          textAlign: 'center',
          overflow: 'hidden'
        }}
      >
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Need Mitigation Help?
        </Typography>
        <Typography variant="body1">
          Get expert recommendations on securing your system
        </Typography>
        
        {/* Decorative elements */}
        <Box sx={{ 
          position: 'absolute', 
          right: -20, 
          bottom: -20, 
          width: 100, 
          height: 100, 
          borderRadius: '50%', 
          backgroundColor: 'rgba(255,255,255,0.1)' 
        }} />
        <Box sx={{ 
          position: 'absolute', 
          left: -15, 
          top: -15, 
          width: 60, 
          height: 60, 
          borderRadius: '50%', 
          backgroundColor: 'rgba(255,255,255,0.1)' 
        }} />
      </Box>
      
      {/* Content Section */}
      <Box sx={{ p: 3, textAlign: 'center', position: 'relative', mt: -4 }}>
        <Avatar 
          sx={{ 
            width: 72, 
            height: 72, 
            mx: 'auto', 
            bgcolor: theme.palette.secondary.main,
            boxShadow: `0px 4px 10px ${alpha(theme.palette.common.black, 0.1)}`
          }}
        >
          <Engineering sx={{ fontSize: 36 }} />
        </Avatar>
        
        <Box sx={{ mt: 3, mb: 3 }}>
          <Typography variant="body1" paragraph>
            Get intelligent recommendations on how to mitigate this threat with best practices and code examples tailored to your environment.
          </Typography>
          
          <List sx={{ textAlign: 'left', mb: 3 }}>
            <ListItem dense>
              <ListItemText 
                primary={<Typography variant="body2">✓ Best practice recommendations</Typography>} 
              />
            </ListItem>
            <ListItem dense>
              <ListItemText 
                primary={<Typography variant="body2">✓ Security implementations</Typography>} 
              />
            </ListItem>
            <ListItem dense>
              <ListItemText 
                primary={<Typography variant="body2">✓ Code examples</Typography>} 
              />
            </ListItem>
          </List>
        </Box>
        
        <Button
          variant="contained"
          size="large"
          color="secondary"
          fullWidth
          startIcon={<Shield />}
          onClick={onSuggestFix}
          sx={{ 
            fontWeight: 'bold', 
            borderRadius: 3,
            py: 1.5
          }}
        >
          Get Mitigation Suggestions
        </Button>
      </Box>
    </Paper>
  );
};

// SuggestedFixesDialog Component for displaying mitigation suggestions
export const SuggestedFixesDialog = ({ 
  open, 
  onClose, 
  suggestedFixes 
}: { 
  open: boolean, 
  onClose: () => void, 
  suggestedFixes: any 
}) => {
  const theme = useTheme();
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 3,
          maxHeight: '90vh',
          overflowX: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main, mr: 2 }}>
            <Shield />
          </Avatar>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            Suggested Fixes & Mitigations
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {suggestedFixes ? (
          <Fade in={true} timeout={300}>
            <Box>
              {/* General Mitigations */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, mr: 2, width: 32, height: 32 }}>
                    <VerifiedUser fontSize="small" />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    General Mitigations
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  {suggestedFixes.mitigationSuggestions?.general?.map((mitigation: any, index: number) => (
                    <Grid item xs={12} key={index}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 2,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            boxShadow: `0px 4px 10px ${alpha(theme.palette.primary.main, 0.1)}`,
                          }
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                          {mitigation.title}
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {mitigation.description}
                        </Typography>
                        <Box sx={{ background: alpha(theme.palette.primary.main, 0.05), p: 2, borderRadius: 2 }}>
                          <Typography variant="subtitle2" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
                            <Code fontSize="small" sx={{ mr: 1 }} /> Implementation
                          </Typography>
                          <Typography variant="body2">
                            {mitigation.implementation}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Specific Mitigations */}
              {suggestedFixes.mitigationSuggestions?.specific?.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main, mr: 2, width: 32, height: 32 }}>
                      <Memory fontSize="small" />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Vulnerability-Specific Mitigations
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    {suggestedFixes.mitigationSuggestions.specific.map((mitigation: any, index: number) => (
                      <Grid item xs={12} key={index}>
                        <Paper 
                          elevation={0} 
                          sx={{ 
                            p: 2, 
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 2,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              boxShadow: `0px 4px 10px ${alpha(theme.palette.info.main, 0.1)}`,
                            }
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                            {mitigation.title}
                          </Typography>
                          <Typography variant="body2" paragraph>
                            {mitigation.description}
                          </Typography>
                          <Box sx={{ background: alpha(theme.palette.info.main, 0.05), p: 2, borderRadius: 2 }}>
                            <Typography variant="subtitle2" gutterBottom color="info.main" sx={{ display: 'flex', alignItems: 'center' }}>
                              <Code fontSize="small" sx={{ mr: 1 }} /> Implementation
                            </Typography>
                            <Typography variant="body2">
                              {mitigation.implementation}
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Best Practices */}
              {suggestedFixes.bestPractices && (
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main, mr: 2, width: 32, height: 32 }}>
                      <Info fontSize="small" />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Best Practices: {suggestedFixes.bestPractices.title}
                    </Typography>
                  </Box>
                  
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.warning.main, 0.03)
                    }}
                  >
                    <Grid container spacing={2}>
                      {suggestedFixes.bestPractices.practices.map((practice: string, index: number) => (
                        <Grid item xs={12} key={index}>
                          <Box sx={{ display: 'flex', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1.5, color: theme.palette.warning.main, minWidth: 24 }}>
                              {index + 1}.
                            </Typography>
                            <Typography variant="body1">
                              {practice}
                            </Typography>
                          </Box>
                          {index < suggestedFixes.bestPractices.practices.length - 1 && (
                            <Divider sx={{ mt: 1.5, opacity: 0.5 }} />
                          )}
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </Box>
              )}

              {/* Implementation Examples */}
              {suggestedFixes.implementationExamples?.length > 0 && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, mr: 2, width: 32, height: 32 }}>
                      <Code fontSize="small" />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Implementation Examples
                    </Typography>
                  </Box>
                  
                  {suggestedFixes.implementationExamples.map((example: any, index: number) => (
                    <Accordion 
                      key={index} 
                      sx={{ 
                        mb: 1.5, 
                        overflow: 'hidden', 
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: '8px !important',
                        '&:before': { display: 'none' }
                      }} 
                      elevation={0}
                    >
                      <AccordionSummary 
                        expandIcon={<ExpandMoreIcon />}
                        sx={{ 
                          background: alpha(theme.palette.primary.main, 0.05),
                          borderBottom: `1px solid ${theme.palette.divider}`  
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {example.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                            <Code fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} /> {example.language}
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        <Box sx={{ p: 2 }}>
                          <Typography variant="body2" paragraph>
                            {example.description}
                          </Typography>
                        </Box>
                        <Box 
                          sx={{ 
                            p: 2, 
                            bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50', 
                            fontFamily: 'monospace', 
                            fontSize: '0.875rem', 
                            overflowX: 'auto',
                            borderTop: `1px solid ${theme.palette.divider}`  
                          }}
                        >
                          <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                            {example.code}
                          </pre>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}
            </Box>
          </Fade>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 6, flexDirection: 'column' }}>
            <CircularProgress size={40} thickness={4} />
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              Generating mitigation suggestions...
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={onClose} 
          color="primary"
          variant="outlined"
          size="large"
          sx={{ borderRadius: 2, px: 4 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};