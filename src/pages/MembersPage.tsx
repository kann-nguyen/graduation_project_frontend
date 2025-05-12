import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Toolbar, 
  Typography, 
  Paper, 
  Grid,
  Card, 
  CardContent,
  Avatar, 
  Chip,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  InputAdornment,
  useTheme,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tabs,
  Tab
} from "@mui/material";
import { 
  PersonAdd, 
  Search, 
  FilterList, 
  Clear, 
  Group, 
  Assignment, 
  BugReport, 
  Email,
  Phone,
  GitHub,
  LinkedIn,
  Timeline
} from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { useGetMembersOfProjectQuery, useAddMemberToProjectMutation, useRemoveMemberFromProjectMutation } from "~/hooks/fetching/project/query";
import { useAccountsQuery } from "~/hooks/fetching/account/query";
import { useUserRole } from "~/hooks/general";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// Extend dayjs
dayjs.extend(relativeTime);

// Add role color helper function at the top before the component
function getRoleColor(role: string, theme: any) {
  switch (role) {
    case 'admin':
      return theme.palette.error.main;
    case 'project_manager':
      return theme.palette.primary.main;
    case 'security_expert':
      return theme.palette.warning.main;
    case 'member':
    default:
      return theme.palette.info.main;
  }
}

export default function MembersPage() {
  const { currentProject } = useParams();
  const membersQuery = useGetMembersOfProjectQuery(currentProject || '');
  const members = membersQuery.data?.data || [];
  const accountsQuery = useAccountsQuery();
  const accounts = accountsQuery.data?.data || [];
  const addMemberMutation = useAddMemberToProjectMutation();
  const removeMemberMutation = useRemoveMemberFromProjectMutation();
  const userRole = useUserRole();
  const theme = useTheme();
  
  // State for member management
  const [open, setOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  // State for filtering accounts in the add member dialog
  const [accountSearchTerm, setAccountSearchTerm] = useState('');
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddMember = async () => {
    if (!selectedAccount || !currentProject) return;
    
    try {
      await addMemberMutation.mutateAsync({
        accountId: selectedAccount,
        projectName: currentProject
      });
      setOpen(false);
      setSelectedAccount('');
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  };
  
  const handleAddMemberDirectly = async (accountId: string) => {
    if (!accountId || !currentProject) return;
    
    try {
      await addMemberMutation.mutateAsync({
        accountId,
        projectName: currentProject
      });
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  };

  const handleRemoveMember = async (accountId: string) => {
    if (!currentProject) return;
    
    try {
      await removeMemberMutation.mutateAsync({
        accountId,
        projectName: currentProject
      });
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };
  
  // Filter members based on search
  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.account?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Calculate statistics
  const totalTasks = members.reduce((sum, member) => sum + member.taskAssigned.length, 0);
  const totalTickets = members.reduce((sum, member) => sum + member.ticketAssigned.length, 0);
  
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
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
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
            <Group sx={{ fontSize: 180, position: 'absolute', top: '50%', right: -20, transform: 'translateY(-50%)' }} />
          </Box>
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Team Members
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage members for {currentProject}
                </Typography>
              </Grid>
              
              <Grid item>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      placeholder="Search members..."
                      size="small"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      sx={{ minWidth: 220 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search fontSize="small" />
                          </InputAdornment>
                        ),
                        endAdornment: searchTerm ? (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setSearchTerm('')}>
                              <Clear fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        ) : null
                      }}
                    />
                  </Box>
                  
                  {userRole === "project_manager" && (
                    <Button
                      variant="contained"
                      startIcon={<PersonAdd />}
                      onClick={() => setOpen(true)}
                    >
                      Add Member
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
        
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
                height: '100%'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                  <Group />
                </Avatar>
                <Typography variant="h6" fontWeight="bold" sx={{ ml: 2 }}>
                  Team Size
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="primary">
                {members.length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Active members in this project
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
                height: '100%'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                  <Assignment />
                </Avatar>
                <Typography variant="h6" fontWeight="bold" sx={{ ml: 2 }}>
                  Assigned Tasks
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="primary">
                {totalTasks}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Total tasks assigned to team members
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
                height: '100%'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                  <BugReport />
                </Avatar>
                <Typography variant="h6" fontWeight="bold" sx={{ ml: 2 }}>
                  Assigned Tickets
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="primary">
                {totalTickets}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Total tickets assigned to team members
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Members List/Table */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="member view tabs">
              <Tab label="Card View" />
              <Tab label="Table View" />
            </Tabs>
          </Box>
          
          {/* Card View */}
          {tabValue === 0 && (
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <Grid item xs={12} sm={6} md={4} key={member._id}>
                      <Card sx={{ 
                        boxShadow: 'none', 
                        border: `1px solid ${theme.palette.divider}`, 
                        borderRadius: 2,
                        height: '100%'
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                            <Avatar 
                              sx={{ 
                                width: 80, 
                                height: 80, 
                                mb: 2,
                                bgcolor: alpha(theme.palette.primary.main, 0.2),
                                color: theme.palette.primary.main,
                                fontSize: 36
                              }}
                            >
                              {member.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="h6" fontWeight="bold" align="center">
                              {member.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" align="center">
                              @{member.account?.username || 'unknown'}
                            </Typography>
                            
                            <Chip 
                              label={member.account?.role.replace('_', ' ').toUpperCase()}
                              size="small"
                              sx={{ 
                                mt: 1,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main
                              }}
                            />
                          </Box>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Assignment fontSize="small" sx={{ color: theme.palette.primary.main, mr: 1 }} />
                                <Typography variant="body2">
                                  Tasks: {member.taskAssigned.length}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <BugReport fontSize="small" sx={{ color: theme.palette.error.main, mr: 1 }} />
                                <Typography variant="body2">
                                  Tickets: {member.ticketAssigned.length}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Timeline fontSize="small" sx={{ color: theme.palette.info.main, mr: 1 }} />
                                <Typography variant="body2">
                                  Activities: {member.activityHistory.length}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                          
                          {userRole === "project_manager" && (
                            <>
                              <Divider sx={{ my: 2 }} />
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button 
                                  variant="outlined" 
                                  color="error" 
                                  size="small"
                                  onClick={() => handleRemoveMember(member.account?._id)}
                                >
                                  Remove
                                </Button>
                              </Box>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Box sx={{ 
                      p: 4, 
                      textAlign: 'center', 
                      bgcolor: alpha(theme.palette.primary.main, 0.03),
                      borderRadius: 2,
                      border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`
                    }}>
                      <Group sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.3), mb: 1 }} />
                      <Typography variant="h6" color="text.secondary">
                        No members found
                      </Typography>
                      {searchTerm && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Try adjusting your search
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
          
          {/* Table View */}
          {tabValue === 1 && (
            <>
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Username</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell align="center">Tasks</TableCell>
                      <TableCell align="center">Tickets</TableCell>
                      <TableCell align="center">Activities</TableCell>
                      {userRole === "project_manager" && <TableCell align="right">Actions</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredMembers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((member) => (
                      <TableRow key={member._id} hover>
                        <TableCell component="th" scope="row">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 1, width: 30, height: 30 }}>
                              {member.name.charAt(0).toUpperCase()}
                            </Avatar>
                            {member.name}
                          </Box>
                        </TableCell>
                        <TableCell>{member.account?.username || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={member.account?.role.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                            size="small"
                            sx={{ 
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">{member.taskAssigned.length}</TableCell>
                        <TableCell align="center">{member.ticketAssigned.length}</TableCell>
                        <TableCell align="center">{member.activityHistory.length}</TableCell>
                        {userRole === "project_manager" && (
                          <TableCell align="right">
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => handleRemoveMember(member.account?._id)}
                            >
                              Remove
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredMembers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </Paper>
      </Container>
      
      {/* Add Member Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" component="div">
            Add Member to Project
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click on a user to add them to {currentProject}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            placeholder="Search users by name, username, email or role..."
            fullWidth
            size="small"
            value={accountSearchTerm}
            onChange={(e) => setAccountSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: accountSearchTerm ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setAccountSearchTerm('')}>
                    <Clear fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null
            }}
          />
          
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {accounts.length > 0 ? (
                accounts
                  .filter(account => 
                    (account.username?.toLowerCase() || '').includes(accountSearchTerm.toLowerCase()) ||
                    (account.email?.toLowerCase() || '').includes(accountSearchTerm.toLowerCase()) ||
                    (account.role?.toLowerCase() || '').includes(accountSearchTerm.toLowerCase())
                  )
                  .map((account) => {
                    // Find user data for this account to show skills
                    const userData = members.find(m => m.account?._id === account._id);
                    const isAlreadyMember = !!userData;
                    
                    return (
                      <Grid item xs={12} sm={6} key={account._id}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            border: `1px solid ${isAlreadyMember 
                              ? alpha(theme.palette.warning.main, 0.5)
                              : theme.palette.divider}`,
                            borderRadius: 2,
                            cursor: isAlreadyMember ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            bgcolor: isAlreadyMember 
                              ? alpha(theme.palette.warning.main, 0.05)
                              : 'background.paper',
                            '&:hover': {
                              borderColor: isAlreadyMember 
                                ? alpha(theme.palette.warning.main, 0.5)
                                : theme.palette.primary.main,
                              bgcolor: isAlreadyMember
                                ? alpha(theme.palette.warning.main, 0.05) 
                                : alpha(theme.palette.primary.main, 0.05)
                            },
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative'
                          }}
                          onClick={() => {
                            if (!isAlreadyMember) {
                              handleAddMemberDirectly(account._id);
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: isAlreadyMember
                                  ? alpha(theme.palette.warning.main, 0.3)
                                  : getRoleColor(account.role || '', theme),
                                mr: 1.5
                              }}
                            >
                              {account.username?.charAt(0).toUpperCase() || 'U'}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle1" component="div" fontWeight="medium" noWrap>
                                  {account.username || 'Unknown User'}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={account.role?.replace('_', ' ').toUpperCase() || 'MEMBER'}
                                  sx={{
                                    fontWeight: 'medium',
                                    bgcolor: alpha(getRoleColor(account.role || '', theme), 0.1),
                                    color: getRoleColor(account.role || '', theme),
                                    ml: 1
                                  }}
                                />
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }} noWrap>
                                <Email fontSize="small" sx={{ mr: 0.5, fontSize: 16 }} />
                                {account.email || 'No email provided'}
                              </Typography>
                            </Box>
                          </Box>
                          
                          {isAlreadyMember && (
                            <Box sx={{ 
                              position: 'absolute', 
                              top: 8, 
                              right: 8,
                              bgcolor: theme.palette.warning.main,
                              color: theme.palette.warning.contrastText,
                              fontSize: '0.7rem',
                              fontWeight: 'bold',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1
                            }}>
                              ALREADY MEMBER
                            </Box>
                          )}
                        </Paper>
                      </Grid>
                    );
                  })
              ) : (
                <Grid item xs={12}>
                  <Box sx={{ 
                    p: 4, 
                    textAlign: 'center', 
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                    borderRadius: 2,
                    border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`
                  }}>
                    <PersonAdd sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.3), mb: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                      Loading users...
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
            
            {accounts.length > 0 && accounts.filter(account => 
              (account.username?.toLowerCase() || '').includes(accountSearchTerm.toLowerCase()) ||
              (account.email?.toLowerCase() || '').includes(accountSearchTerm.toLowerCase()) ||
              (account.role?.toLowerCase() || '').includes(accountSearchTerm.toLowerCase())
            ).length === 0 && (
              <Box sx={{ 
                p: 4, 
                textAlign: 'center', 
                bgcolor: alpha(theme.palette.primary.main, 0.03),
                borderRadius: 2,
                border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                mt: 2
              }}>
                <PersonAdd sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.3), mb: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  No users found
                </Typography>
                {accountSearchTerm && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Try adjusting your search criteria
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}