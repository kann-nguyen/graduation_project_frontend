import { GitHub, Close, Add } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  useTheme,
  alpha,
  Stack,
  Typography,
  IconButton,
  Paper,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { RepoImport } from "~/hooks/fetching/git";
import { useGetRepo } from "~/hooks/fetching/git/query";
import { useImportProjectMutation } from "~/hooks/fetching/project/query";
import { GitLab } from "~/icons/Icons";

interface Data {
  data: RepoImport;
}

export default function ImportProject({ setClose }: { setClose: () => void }) {
  const theme = useTheme();
  const importProjectMutation = useImportProjectMutation();
  const { control, handleSubmit } = useForm<Data>();
  const importProjectListQuery = useGetRepo();
  
  if (importProjectListQuery[0].isError || importProjectListQuery[1].isError)
    return <></>;
    
  const importProjectList = importProjectListQuery.flatMap(
    (item) => item.data?.data ?? []
  );
  
  async function onSubmit(data: Data) {
    importProjectMutation.mutate(data.data);
    setClose();
  }
  
  function groupSelection(url: string) {
    if (url.includes("github")) return "Github";
    if (url.includes("gitlab")) return "Gitlab";
    return "Other";
  }
  
  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
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
            <Add sx={{ fontSize: 26, color: theme.palette.primary.main }} />
            Add New Project
          </Typography>
          <IconButton 
            onClick={setClose}
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
      
      <DialogContent sx={{ py: 3, px: 3 }}>
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ mb: 2.5 }}
        >
          Import a project from your GitHub or GitLab repositories
        </Typography>
        
        <Controller
          name="data"
          control={control}
          render={({ field: { onChange } }) => (
            <Autocomplete
              onChange={(event, newValue) => onChange(newValue)}
              options={importProjectList}
              getOptionLabel={(option) => option.url}
              renderOption={(props, option) => (
                <Paper 
                  component="li" 
                  elevation={0}
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    p: 1.5,
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.grey[100], 0.5),
                    },
                    "& > svg": { mr: 2 }
                  }} 
                  {...props}
                >
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 36,
                      height: 36,
                      borderRadius: '8px',
                      bgcolor: alpha(theme.palette.grey[200], 0.7),
                      color: option.url.includes("github") 
                        ? "#24292F" 
                        : "#FC6D26",
                      mr: 2
                    }}
                  >
                    {option.url.includes("github") ? <GitHub /> : <GitLab />}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" fontWeight="medium">
                      {option.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {option.url}
                    </Typography>
                  </Box>
                  <Chip 
                    label={option.status} 
                    size="small"
                    sx={{ 
                      ml: 1,
                      bgcolor: option.status === "public" 
                        ? alpha(theme.palette.success.main, 0.1)
                        : alpha(theme.palette.info.main, 0.1),
                      color: option.status === "public"
                        ? theme.palette.success.dark
                        : theme.palette.info.dark,
                      fontWeight: 'medium'
                    }} 
                  />
                </Paper>
              )}
              groupBy={(option) => groupSelection(option.url)}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Choose a repository" 
                  variant="outlined"
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.2s ease',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.light,
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderWidth: '1px',
                      }
                    }
                  }}
                />
              )}
              PaperComponent={({ children, ...props }) => (
                <Paper
                  {...props}
                  elevation={6}
                  sx={{ 
                    mt: 1,
                    borderRadius: 2,
                    boxShadow: theme.shadows[6],
                    '& .MuiAutocomplete-groupLabel': {
                      backgroundColor: alpha(theme.palette.primary.light, 0.05),
                      fontWeight: 'bold',
                      px: 2,
                      py: 1
                    },
                    '& .MuiAutocomplete-listbox': {
                      p: 1
                    }
                  }}
                >
                  {children}
                </Paper>
              )}
            />
          )}
        />
      </DialogContent>
      
      <DialogActions sx={{ 
        justifyContent: 'flex-end', 
        p: 2.5, 
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        background: alpha(theme.palette.primary.light, 0.05),
      }}>
        <Button 
          onClick={setClose} 
          color="inherit"
          sx={{ 
            fontWeight: 'medium',
            px: 2,
            py: 0.75, 
            borderRadius: 2
          }}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained"
          sx={{ 
            fontWeight: 'medium',
            px: 2.5,
            py: 0.75,
            borderRadius: 2,
            boxShadow: 2,
            ml: 1.5
          }}
        >
          Import Project
        </Button>
      </DialogActions>
    </Box>
  );
}
