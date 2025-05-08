import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  useTheme,
  alpha,
  Paper,
  Dialog,
  ButtonGroup,
  Stack,
  Tooltip,
  Link,
  DialogTitle,
  DialogContent,
  List,
  ListItemButton,
  IconButton,
  DialogActions,
} from "@mui/material";
import {
  Add,
  KeyboardArrowDown,
  Business,
  Dashboard,
  Book,
  SwapHoriz,
  Close
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useProjectInQuery } from "~/hooks/fetching/user/query";
import { useProjectInfoQuery } from "~/hooks/fetching/project/query";
import { useUserRole } from "~/hooks/general";
import { useSnackbar } from "notistack";
import ImportProject from "~/components/dialogs/ImportProjectDialog";
import dayjs from "dayjs";

interface ProjectSelectorProps {
  variant?: 'detailed' | 'compact';
  onProjectChange?: (projectName: string) => void;
}

export default function ProjectSelector({ variant = 'detailed', onProjectChange }: ProjectSelectorProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { currentProject } = useParams();
  const userRole = useUserRole();
  const isProjectManager = userRole === "project_manager";
  
  // State
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [openProjectListDialog, setOpenProjectListDialog] = useState(false);
  
  // Queries
  const projectInQuery = useProjectInQuery();
  const projects = projectInQuery.data?.data || [];
  const projectInfoQuery = useProjectInfoQuery(currentProject || '');
  const projectInfo = projectInfoQuery.data?.data;
  
  // Set initial active project
  useEffect(() => {
    if (projects.length > 0) {
      const initialProject = currentProject || projects[0]?.name;
      setActiveProject(initialProject);
    }
  }, [projects, currentProject]);
  
  // Handle project selection
  const handleProjectMenuOpen = () => {
    setOpenProjectListDialog(true);
  };
  
  const handleSwitchProject = (projectName: string) => {
    setActiveProject(projectName);
    setOpenProjectListDialog(false);
    
    if (onProjectChange) {
      onProjectChange(projectName);
    } else {
      navigate(`/${encodeURIComponent(projectName)}/`);
    }
  };
  
  // Handle dialog close
  const handleCloseImportDialog = () => {
    setOpenImportDialog(false);
  };
  
  // Compact version of the selector (for use in smaller spaces or navbars)
  if (variant === 'compact') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Button
          onClick={handleProjectMenuOpen}
          endIcon={<KeyboardArrowDown sx={{ fontSize: 24 }} />}
          sx={{ 
            fontWeight: 'bold',
            textTransform: 'none',
            fontSize: '1.2rem',
            py: 1
          }}
          color="inherit"
        >
          {activeProject || "Select Project"}
        </Button>
        
        {/* Project List Dialog */}
        <Dialog
          open={openProjectListDialog}
          onClose={() => setOpenProjectListDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { 
              borderRadius: 3,
              boxShadow: theme.shadows[10],
              overflow: 'hidden'
            }
          }}
        >
          <DialogTitle 
            sx={{ 
              pb: 1.5, 
              pt: 2.5,
              px: 3,
              background: alpha(theme.palette.primary.light, 0.05),
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <SwapHoriz sx={{ fontSize: 26, color: theme.palette.primary.main }} />
                Switch Project
              </Typography>
              <IconButton 
                onClick={() => setOpenProjectListDialog(false)}
                sx={{ 
                  color: theme.palette.grey[600],
                  '&:hover': { 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main
                  }
                }}
              >
                <Close />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <List sx={{ py: 1 }}>
              {projects.map((project) => (
                <ListItemButton 
                  key={project._id} 
                  onClick={() => handleSwitchProject(project.name)}
                  selected={activeProject === project.name}
                  sx={{ 
                    py: 2, 
                    px: 3,
                    transition: 'all 0.2s ease',
                    '&.Mui-selected': {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      borderLeft: `4px solid ${theme.palette.primary.main}`,
                      pl: 2.6,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                      }
                    },
                    '&:hover': {
                      bgcolor: alpha(theme.palette.grey[100], 0.5),
                    }
                  }}
                >
                  <Stack direction="row" spacing={2.5} alignItems="center" width="100%">
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 42,
                      height: 42,
                      borderRadius: '12px',
                      bgcolor: activeProject === project.name 
                        ? alpha(theme.palette.primary.main, 0.12)
                        : alpha(theme.palette.grey[200], 0.7),
                      color: activeProject === project.name
                        ? theme.palette.primary.main
                        : theme.palette.grey[700]
                    }}>
                      <Book fontSize="medium" />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        fontSize="1.1rem" 
                        fontWeight={activeProject === project.name ? 'bold' : 'medium'}
                        color={activeProject === project.name ? 'primary.main' : 'text.primary'}
                      >
                        {project.name}
                      </Typography>
                    </Box>
                  </Stack>
                </ListItemButton>
              ))}
            </List>
          </DialogContent>
          {isProjectManager && (
            <DialogActions sx={{ 
              justifyContent: 'flex-start', 
              p: 2.5, 
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              background: alpha(theme.palette.primary.light, 0.05),
            }}>
              <Button
                variant="contained"
                onClick={() => {
                  setOpenProjectListDialog(false);
                  setOpenImportDialog(true);
                }}
                startIcon={<Add />}
                sx={{ 
                  fontWeight: 'medium',
                  px: 2.5,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: 2
                }}
              >
                Add New Project
              </Button>
            </DialogActions>
          )}
        </Dialog>
        
        <Dialog
          open={openImportDialog}
          onClose={handleCloseImportDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { 
              borderRadius: 3,
              boxShadow: theme.shadows[10],
              overflow: 'hidden'
            }
          }}
        >
          <ImportProject setClose={handleCloseImportDialog} />
        </Dialog>
      </Box>
    );
  }
  
  // Detailed version (default, for use in page headers)
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        mb: 4, 
        borderRadius: 2, 
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box 
          sx={{ 
            mr: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main
          }}
        >
          <Dashboard sx={{ fontSize: 32 }} />
        </Box>
        
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
            {activeProject || "Select Project"}
          </Typography>
          
          <Stack direction="row" spacing={2} alignItems="center">
            {projectInfo && projectInfo.createdAt && (
              <Typography variant="body1" color="text.secondary">
                Created {dayjs(projectInfo.createdAt).format('MMM DD, YYYY')}
              </Typography>
            )}
            
            {projectInfo && projectInfo.url && (
              <Link 
                href={projectInfo.url} 
                target="_blank"
                underline="hover"
                variant="body1"
                color="text.secondary"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <Business sx={{ fontSize: 20 }} />
                Repository
              </Link>
            )}
          </Stack>
        </Box>
        
        {/* Project List Dialog */}
        <Dialog
          open={openProjectListDialog}
          onClose={() => setOpenProjectListDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { 
              borderRadius: 3,
              boxShadow: theme.shadows[10],
              overflow: 'hidden'
            }
          }}
        >
          <DialogTitle 
            sx={{ 
              pb: 1.5, 
              pt: 2.5,
              px: 3,
              background: alpha(theme.palette.primary.light, 0.05),
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <SwapHoriz sx={{ fontSize: 26, color: theme.palette.primary.main }} />
                Switch Project
              </Typography>
              <IconButton 
                onClick={() => setOpenProjectListDialog(false)}
                sx={{ 
                  color: theme.palette.grey[600],
                  '&:hover': { 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main
                  }
                }}
              >
                <Close />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <List sx={{ py: 1 }}>
              {projects.map((project) => (
                <ListItemButton 
                  key={project._id} 
                  onClick={() => handleSwitchProject(project.name)}
                  selected={activeProject === project.name}
                  sx={{ 
                    py: 2, 
                    px: 3,
                    transition: 'all 0.2s ease',
                    '&.Mui-selected': {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      borderLeft: `4px solid ${theme.palette.primary.main}`,
                      pl: 2.6,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                      }
                    },
                    '&:hover': {
                      bgcolor: alpha(theme.palette.grey[100], 0.5),
                    }
                  }}
                >
                  <Stack direction="row" spacing={2.5} alignItems="center" width="100%">
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 42,
                      height: 42,
                      borderRadius: '12px',
                      bgcolor: activeProject === project.name 
                        ? alpha(theme.palette.primary.main, 0.12)
                        : alpha(theme.palette.grey[200], 0.7),
                      color: activeProject === project.name
                        ? theme.palette.primary.main
                        : theme.palette.grey[700]
                    }}>
                      <Book fontSize="medium" />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        fontSize="1.1rem" 
                        fontWeight={activeProject === project.name ? 'bold' : 'medium'}
                        color={activeProject === project.name ? 'primary.main' : 'text.primary'}
                      >
                        {project.name}
                      </Typography>
                    </Box>
                  </Stack>
                </ListItemButton>
              ))}
            </List>
          </DialogContent>
          {isProjectManager && (
            <DialogActions sx={{ 
              justifyContent: 'flex-start', 
              p: 2.5, 
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              background: alpha(theme.palette.primary.light, 0.05),
            }}>
              <Button
                variant="contained"
                onClick={() => {
                  setOpenProjectListDialog(false);
                  setOpenImportDialog(true);
                }}
                startIcon={<Add />}
                sx={{ 
                  fontWeight: 'medium',
                  px: 2.5,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: 2
                }}
              >
                Add New Project
              </Button>
            </DialogActions>
          )}
        </Dialog>
      </Box>
      
      <ButtonGroup size="large">
        <Tooltip title="Switch Project">
          <Button
            variant="outlined"
            onClick={handleProjectMenuOpen}
            startIcon={<SwapHoriz sx={{ fontSize: 24 }} />}
            sx={{ 
              fontSize: '1.1rem',
              py: 1,
              px: 2,
              fontWeight: 'medium'
            }}
          >
            Switch
          </Button>
        </Tooltip>
    
      </ButtonGroup>
      
      {/* Import Project Dialog */}
      <Dialog
        open={openImportDialog}
        onClose={handleCloseImportDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 3,
            boxShadow: theme.shadows[10],
            overflow: 'hidden'
          }
        }}
      >
        <ImportProject setClose={handleCloseImportDialog} />
      </Dialog>
    </Paper>
  );
}