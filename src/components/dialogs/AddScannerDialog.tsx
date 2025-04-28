import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import { Scanner as ScannerIcon, Add } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { useAddScannerToPhaseMutation } from "~/hooks/fetching/phase/query";
import { useGetScanners } from "~/hooks/fetching/scanner/query";
import { Scanner } from "~/hooks/fetching/scanner";

interface AddScannerDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  phaseId: string;
  phaseScanners: Scanner[];
}

export default function AddScannerDialog({
  open,
  setOpen,
  phaseId,
  phaseScanners,
}: AddScannerDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [selectedScannerId, setSelectedScannerId] = useState<string | null>(null);
  const addScannerMutation = useAddScannerToPhaseMutation();
  
  const scannersQuery = useGetScanners();
  const allScanners = scannersQuery.data?.data || [];
  
  // Filter out scanners that are already added to the phase
  const availableScanners = allScanners.filter(
    scanner => !phaseScanners.some(ps => ps._id === scanner._id)
  );

  const handleScannerSelect = (scannerId: string) => {
    setSelectedScannerId(scannerId);
  };

  const handleAddScanner = () => {
    if (!selectedScannerId) {
      enqueueSnackbar("Please select a scanner first", { variant: "warning" });
      return;
    }
    
    addScannerMutation.mutate(
      { phaseId, scannerId: selectedScannerId }, 
      {
        onSuccess: (response) => {
          if (response.status === "success") {
            enqueueSnackbar("Scanner added successfully!", { variant: "success" });
            setSelectedScannerId(null);
            setOpen(false);
          } else {
            enqueueSnackbar(`Failed to add scanner: ${response.message}`, { variant: "error" });
          }
        },
        onError: () => {
          enqueueSnackbar("Error occurred while adding scanner", { variant: "error" });
        }
      }
    );
  };

  const handleClose = () => {
    setSelectedScannerId(null);
    setOpen(false);
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{ 
        sx: { height: '80vh', maxHeight: '600px', display: 'flex', flexDirection: 'column' } 
      }}
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          Add Scanner to Phase
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select a scanner from the list below and click "Add Scanner"
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 0, overflow: 'hidden' }}>
        {availableScanners.length > 0 ? (
          <Paper 
            variant="outlined" 
            sx={{ 
              flexGrow: 1, 
              overflow: 'auto', 
              borderRadius: 0, 
              borderLeft: 'none', 
              borderRight: 'none'
            }}
          >
            <List sx={{ py: 0 }}>
              {availableScanners.map((scanner, index) => (
                <Box key={scanner._id}>
                  <ListItem disablePadding>
                    <ListItemButton 
                      selected={selectedScannerId === scanner._id}
                      onClick={() => handleScannerSelect(scanner._id)}
                      sx={{
                        '&.Mui-selected': {
                          backgroundColor: 'primary.light',
                        },
                        '&.Mui-selected:hover': {
                          backgroundColor: 'primary.light',
                        }
                      }}
                    >
                      <ListItemIcon>
                        <ScannerIcon color={selectedScannerId === scanner._id ? "primary" : "action"} />
                      </ListItemIcon>
                      <ListItemText
                        primary={scanner.name}
                        secondary={
                          <Typography variant="body2" color="text.secondary" noWrap>
                            Created by: {scanner.createdBy}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < availableScanners.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Paper>
        ) : (
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              flexDirection: 'column', 
              height: '100%',
              p: 3
            }}
          >
            <ScannerIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              No available scanners
            </Typography>
            <Typography variant="body2" color="textSecondary" align="center">
              All scanners are already added to this phase
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button onClick={handleClose} color="inherit">Cancel</Button>
        <Button 
          onClick={handleAddScanner}
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          disabled={!selectedScannerId}
        >
          Add Scanner
        </Button>
      </DialogActions>
    </Dialog>
  );
}