
import { useNavigate } from "react-router-dom";
import { useTheme, alpha, SxProps } from "@mui/material";

import {
  Card,
  Box,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  Tooltip,
  Button,
  Divider,
  Paper,
  Stack,
} from "@mui/material";

import {
  Timeline,
  Assignment,
  Article,
  Visibility,
  CheckCircle,
  TrendingUp
} from "@mui/icons-material";


import { Phase } from "~/hooks/fetching/phase";

/**
 * Component hiển thị bảng tổng quan các phases
 * @param phases - Danh sách các phase của project
 * @param sx - Style tùy chỉnh cho component
 */
export default function PhaseBoard({
  phases,
  sx,
}: {
  phases: Phase[];
  sx?: SxProps;
}) {
  const navigate = useNavigate();
  const theme = useTheme();
  
  /**
   * Hàm điều hướng đến trang chi tiết phase
   * @param phaseId - ID của phase cần xem chi tiết
   */
  function visitDetails(phaseId: string) {
    return () => {
      navigate(`${phaseId}`);
    };
  }
  
  // Tính toán các thống kê tổng quan
  const totalTasks = phases.reduce((sum, phase) => sum + phase.tasks.length, 0);
  const totalArtifacts = phases.reduce((sum, phase) => sum + phase.artifacts.length, 0);
  const completedTasks = phases.reduce((sum, phase) => 
    sum + phase.tasks.filter(task => task.status === 'completed').length, 0
  );
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  /**
   * Hàm lấy màu cho phase dựa trên index
   * @param index - Vị trí của phase trong danh sách
   * @returns Màu từ palette theme
   */
  const getPhaseColor = (index: number) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.error.main,
    ];
    return colors[index % colors.length];
  };

  /**
   * Hàm tính phần trăm tiến độ hoàn thành của phase
   * @param phase - Thông tin phase
   * @returns Phần trăm hoàn thành (0-100)
   */
  const getPhaseProgress = (phase: Phase) => {
    if (phase.tasks.length === 0) return 0;
    const completed = phase.tasks.filter(task => task.status === 'completed').length;
    return (completed / phase.tasks.length) * 100;
  };
  // Render the phase board UI
  return (
    <Card 
      sx={{
        ...sx,
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
        border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
        backdropFilter: 'blur(8px)',
        background: theme.palette.mode === 'light' 
          ? `linear-gradient(145deg, ${alpha('#ffffff', 0.95)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`
          : `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.primary.dark, 0.2)} 100%)`,
      }}
      elevation={0}
    >
      {/* Phase Overview Header */}
      <CardHeader
        avatar={
          <Avatar 
            sx={{ 
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
              color: 'white',
              width: 54,
              height: 54,
              boxShadow: '0 3px 12px rgba(0,0,0,0.12)'
            }}
          >
            <Timeline sx={{ fontSize: 28 }} />
          </Avatar>
        }
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
            <Typography 
              variant="h5" 
              component="h2"
              fontWeight="700" 
              sx={{ 
                color: theme.palette.primary.main,
                letterSpacing: '-0.3px',
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
              }}
            >
              Phase Overview
            </Typography>
            <Chip 
              label={`${phases.length} Phase${phases.length !== 1 ? 's' : ''}`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ 
                borderRadius: '12px',
                fontWeight: 'medium',
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              }}
            />
          </Box>
        }
        subheader={
          <Box sx={{ mt: 1.5 }}>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                mb: 2.5,
                maxWidth: '90%',
                lineHeight: 1.5
              }}
            >
              Manage project phases, track progress, and organize deliverables
            </Typography>
            
            {/* Progress Summary Card */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 2.5, 
                bgcolor: alpha(theme.palette.primary.main, 0.03),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Background decorative element */}
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.primary.light, 0.07)} 100%)`,
                  zIndex: 0
                }} 
              />
              
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Stack 
                  direction="row" 
                  justifyContent="space-between" 
                  alignItems="center" 
                  mb={1.5}
                >
                  <Typography 
                    variant="subtitle2" 
                    fontWeight="600" 
                    color="primary"
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <TrendingUp fontSize="small" /> Overall Progress
                  </Typography>
                  <Chip
                    label={`${Math.round(completionRate)}%`}
                    color="primary"
                    size="small"
                    sx={{ 
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      height: 28,
                      borderRadius: '14px'
                    }}
                  />
                </Stack>
                
                {/* Progress Bar */}
                <LinearProgress 
                  variant="determinate" 
                  value={completionRate} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    bgcolor: alpha(theme.palette.grey[300], 0.5),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      backgroundImage: `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.primary.main} 100%)`
                    }
                  }}
                />
                
                {/* Statistics */}
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={{ xs: 1, sm: 3 }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  mt={2.5}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        color: theme.palette.success.main 
                      }}
                    >
                      <CheckCircle sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Completed Tasks
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {completedTasks}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main
                      }}
                    >
                      <Assignment sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Tasks
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {totalTasks}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                        color: theme.palette.secondary.main
                      }}
                    >
                      <Article sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Artifacts
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {totalArtifacts}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </Paper>
          </Box>
        }
        sx={{ pb: 1, pt: 2.5, px: { xs: 2, sm: 3 } }}
      />
      
      <Divider sx={{ mx: 3, opacity: 0.6 }} />
      
      <CardContent sx={{ p: 0 }}>
        {/* Không có phase nào thì hiển thị text tạo phase */}
        {phases.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 6, 
            px: 3,
            color: 'text.secondary'
          }}>
            <Timeline sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" gutterBottom>
              No phases found
            </Typography>
            <Typography variant="body2">
              Create your first phase to get started
            </Typography>
          </Box>
        ) : (
          // bảng danh sách phases
          <Table sx={{ '& .MuiTableCell-root': { borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}` } }}>            <TableHead>
              <TableRow sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.02),
                '& .MuiTableCell-head': {
                  fontWeight: 'bold',
                  color: theme.palette.primary.main,
                  fontSize: '0.875rem',
                  py: 2,
                }
              }}>
                <TableCell>Phase Details</TableCell>
                <TableCell align="center">Progress</TableCell>
                <TableCell align="center">Tasks</TableCell>
                <TableCell align="center">Artifacts</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {phases.map((phase, index) => {
                const progress = getPhaseProgress(phase);
                const phaseColor = getPhaseColor(index);
                
                return (
                  <TableRow 
                    key={phase._id}
                    sx={{ 
                      '&:hover': { 
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                        transform: 'translateY(-1px)',
                        boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.1)}`
                      },
                      transition: 'all 0.2s ease-in-out',
                      cursor: 'pointer'
                    }}
                    onClick={visitDetails(phase._id)}
                  >
                    {/* Name, description */}
                    <TableCell sx={{ py: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: alpha(phaseColor, 0.15), 
                            color: phaseColor,
                            width: 40,
                            height: 40,
                            fontSize: '0.875rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {index + 1}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 0.5 }}>
                            {phase.name}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: 1.4
                            }}
                          >
                            {phase.description || 'No description provided'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    {/* Hiển thị tiến độ */}
                    <TableCell align="center" sx={{ py: 3 }}>
                      <Box sx={{ minWidth: 80 }}>
                        <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                          {Math.round(progress)}%
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={progress}
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            bgcolor: alpha(phaseColor, 0.1),
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              bgcolor: phaseColor
                            }
                          }}
                        />
                      </Box>
                    </TableCell>
                    
                    {/* Hiển thị số lượng task */}
                    <TableCell align="center" sx={{ py: 3 }}>
                      <Tooltip title={`${phase.tasks.filter(t => t.status === 'completed').length} completed of ${phase.tasks.length} total`}>
                        <Chip
                          label={phase.tasks.length}
                          size="small"
                          icon={<Assignment sx={{ fontSize: 16 }} />}
                          color={phase.tasks.length > 0 ? "primary" : "default"}
                          variant={phase.tasks.length > 0 ? "filled" : "outlined"}
                        />
                      </Tooltip>
                    </TableCell>
                    
                    {/* Hiển thị số lượng artifacts */}
                    <TableCell align="center" sx={{ py: 3 }}>
                      <Tooltip title="Project artifacts and deliverables">
                        <Chip
                          label={phase.artifacts.length}
                          size="small"
                          icon={<Article sx={{ fontSize: 16 }} />}
                          color={phase.artifacts.length > 0 ? "secondary" : "default"}
                          variant={phase.artifacts.length > 0 ? "filled" : "outlined"}
                        />
                      </Tooltip>
                    </TableCell>
                    
                    {/* Nút xem chi tiết phase */}
                    <TableCell align="center" sx={{ py: 3 }}>
                      <Tooltip title="View phase details">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Visibility />}
                          onClick={(e) => {
                            e.stopPropagation();
                            visitDetails(phase._id)();
                          }}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 'medium',
                            minWidth: 'auto',
                            px: 2
                          }}
                        >
                          View
                        </Button>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
