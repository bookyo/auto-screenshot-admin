import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  IconButton,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
  Chip,
  Typography,
  CardHeader,
  FormControlLabel,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { getMaccmsList, createMaccms, updateMaccms, deleteMaccms, configureMaccmsSetting } from '../services/maccmsService';
import { Maccms } from '../types';

const maccmsValidationSchema = Yup.object({
  url: Yup.string().url('Must be a valid URL').required('URL is required'),
  geturl: Yup.string().url('Must be a valid URL').optional(),
  delcategory: Yup.string().optional(),
  cjnum: Yup.number().min(0, 'Must be a positive number').optional(),
});

const settingsValidationSchema = Yup.object({
  url: Yup.string().url('Must be a valid URL').required('URL is required'),
  geturl: Yup.string().url('Must be a valid URL').optional(),
  delcategory: Yup.string().optional(),
  date: Yup.number().min(0, 'Must be a positive number').optional(),
  cron: Yup.number().min(0, 'Must be a positive number').optional(),
  cjnum: Yup.number().min(0, 'Must be a positive number').optional(),
});

const MaccmsPage: React.FC = () => {
  const [maccmsList, setMaccmsList] = useState<Maccms[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openSettingsDialog, setOpenSettingsDialog] = useState<boolean>(false);
  const [editingMaccms, setEditingMaccms] = useState<Maccms | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [maccmsToDelete, setMaccmsToDelete] = useState<Maccms | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchMaccmsList = async () => {
    try {
      setLoading(true);
      const data = await getMaccmsList();
      setMaccmsList(data);
    } catch (error) {
      console.error('Error fetching maccms list:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch maccms list',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaccmsList();
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const maccmsFormik = useFormik({
    initialValues: {
      url: '',
      geturl: '',
      delcategory: '',
      open: true,
      ism3u8: false,
      date: 0,
      cron: 0,
      cjnum: 10,
    },
    validationSchema: maccmsValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (editingMaccms) {
          // Update existing maccms
          await updateMaccms(editingMaccms._id, values);
          setSnackbar({
            open: true,
            message: 'Maccms updated successfully',
            severity: 'success',
          });
        } else {
          // Create new maccms
          await createMaccms(values);
          setSnackbar({
            open: true,
            message: 'Maccms created successfully',
            severity: 'success',
          });
        }
        
        resetForm();
        setOpenDialog(false);
        setEditingMaccms(null);
        fetchMaccmsList();
      } catch (error: any) {
        console.error('Error saving maccms:', error);
        setSnackbar({
          open: true,
          message: error.message || 'Failed to save maccms',
          severity: 'error',
        });
      }
    },
  });

  const settingsFormik = useFormik({
    initialValues: {
      url: '',
      geturl: '',
      delcategory: '',
      open: true,
      ism3u8: false,
      date: 0,
      cron: 0,
      cjnum: 10,
    },
    validationSchema: settingsValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await configureMaccmsSetting(values);
        setSnackbar({
          open: true,
          message: 'Maccms settings updated successfully',
          severity: 'success',
        });
        
        setOpenSettingsDialog(false);
        fetchMaccmsList();
      } catch (error: any) {
        console.error('Error saving maccms settings:', error);
        setSnackbar({
          open: true,
          message: error.message || 'Failed to save maccms settings',
          severity: 'error',
        });
      }
    },
  });

  const handleOpenDialog = (maccms?: Maccms) => {
    if (maccms) {
      setEditingMaccms(maccms);
      maccmsFormik.setValues({
        url: maccms.url || '',
        geturl: maccms.geturl || '',
        delcategory: maccms.delcategory || '',
        open: maccms.open || false,
        ism3u8: maccms.ism3u8 || false,
        date: maccms.date || 0,
        cron: maccms.cron || 0,
        cjnum: maccms.cjnum || 10,
      });
    } else {
      setEditingMaccms(null);
      maccmsFormik.resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMaccms(null);
    maccmsFormik.resetForm();
  };

  const handleOpenSettingsDialog = () => {
    // If we have at least one maccms entry, use its values as defaults
    if (maccmsList.length > 0) {
      const firstMaccms = maccmsList[0];
      settingsFormik.setValues({
        url: firstMaccms.url || '',
        geturl: firstMaccms.geturl || '',
        delcategory: firstMaccms.delcategory || '',
        open: firstMaccms.open || false,
        ism3u8: firstMaccms.ism3u8 || false,
        date: firstMaccms.date || 0,
        cron: firstMaccms.cron || 0,
        cjnum: firstMaccms.cjnum || 10,
      });
    }
    setOpenSettingsDialog(true);
  };

  const handleCloseSettingsDialog = () => {
    setOpenSettingsDialog(false);
    settingsFormik.resetForm();
  };

  const handleDeleteClick = (maccms: Maccms) => {
    setMaccmsToDelete(maccms);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!maccmsToDelete) return;
    
    try {
      await deleteMaccms(maccmsToDelete._id);
      setSnackbar({
        open: true,
        message: 'Maccms deleted successfully',
        severity: 'success',
      });
      fetchMaccmsList();
    } catch (error) {
      console.error('Error deleting maccms:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete maccms',
        severity: 'error',
      });
    } finally {
      setDeleteConfirmOpen(false);
      setMaccmsToDelete(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Maccms Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<SettingsIcon />}
            onClick={handleOpenSettingsDialog}
            sx={{ mr: 2 }}
          >
            Global Settings
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Maccms
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardHeader title="Maccms Information" />
        <CardContent>
          <Typography variant="body1" paragraph>
            Maccms is a content management system used for managing media content. This section allows you to configure and manage Maccms instances.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Use the global settings to configure default behavior for all Maccms instances.
          </Typography>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>URL</TableCell>
                <TableCell>Get URL</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>M3U8</TableCell>
                <TableCell>CJ Num</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {maccmsList.length > 0 ? (
                maccmsList.map((maccms) => (
                  <TableRow key={maccms._id}>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {maccms.url}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {maccms.geturl}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={maccms.open ? 'Active' : 'Inactive'}
                        color={maccms.open ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={maccms.ism3u8 ? 'Yes' : 'No'}
                        color={maccms.ism3u8 ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{maccms.cjnum}</TableCell>
                    <TableCell>
                      {maccms.meta?.updateAt ? new Date(maccms.meta.updateAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(maccms)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(maccms)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No maccms entries found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Maccms Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <form onSubmit={maccmsFormik.handleSubmit}>
          <DialogTitle>
            {editingMaccms ? 'Edit Maccms' : 'Add New Maccms'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  id="url"
                  name="url"
                  label="URL"
                  value={maccmsFormik.values.url}
                  onChange={maccmsFormik.handleChange}
                  error={maccmsFormik.touched.url && Boolean(maccmsFormik.errors.url)}
                  helperText={maccmsFormik.touched.url && maccmsFormik.errors.url}
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  id="geturl"
                  name="geturl"
                  label="Get URL"
                  value={maccmsFormik.values.geturl}
                  onChange={maccmsFormik.handleChange}
                  error={maccmsFormik.touched.geturl && Boolean(maccmsFormik.errors.geturl)}
                  helperText={maccmsFormik.touched.geturl && maccmsFormik.errors.geturl}
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  id="delcategory"
                  name="delcategory"
                  label="Delete Category"
                  value={maccmsFormik.values.delcategory}
                  onChange={maccmsFormik.handleChange}
                  error={maccmsFormik.touched.delcategory && Boolean(maccmsFormik.errors.delcategory)}
                  helperText={maccmsFormik.touched.delcategory && maccmsFormik.errors.delcategory}
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  id="date"
                  name="date"
                  label="Date"
                  type="number"
                  value={maccmsFormik.values.date}
                  onChange={maccmsFormik.handleChange}
                  error={maccmsFormik.touched.date && Boolean(maccmsFormik.errors.date)}
                  helperText={maccmsFormik.touched.date && maccmsFormik.errors.date}
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  id="cron"
                  name="cron"
                  label="Cron"
                  type="number"
                  value={maccmsFormik.values.cron}
                  onChange={maccmsFormik.handleChange}
                  error={maccmsFormik.touched.cron && Boolean(maccmsFormik.errors.cron)}
                  helperText={maccmsFormik.touched.cron && maccmsFormik.errors.cron}
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  id="cjnum"
                  name="cjnum"
                  label="CJ Num"
                  type="number"
                  value={maccmsFormik.values.cjnum}
                  onChange={maccmsFormik.handleChange}
                  error={maccmsFormik.touched.cjnum && Boolean(maccmsFormik.errors.cjnum)}
                  helperText={maccmsFormik.touched.cjnum && maccmsFormik.errors.cjnum}
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={maccmsFormik.values.open}
                        onChange={(e) => maccmsFormik.setFieldValue('open', e.target.checked)}
                        name="open"
                      />
                    }
                    label="Active"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={maccmsFormik.values.ism3u8}
                        onChange={(e) => maccmsFormik.setFieldValue('ism3u8', e.target.checked)}
                        name="ism3u8"
                      />
                    }
                    label="Is M3U8"
                  />
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {maccmsFormik.isSubmitting ? <CircularProgress size={24} /> : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={openSettingsDialog} onClose={handleCloseSettingsDialog} maxWidth="md" fullWidth>
        <form onSubmit={settingsFormik.handleSubmit}>
          <DialogTitle>
            Global Maccms Settings
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 2 }}>
              These settings will be applied globally to all Maccms instances.
            </Typography>
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  id="url"
                  name="url"
                  label="Default URL"
                  value={settingsFormik.values.url}
                  onChange={settingsFormik.handleChange}
                  error={settingsFormik.touched.url && Boolean(settingsFormik.errors.url)}
                  helperText={settingsFormik.touched.url && settingsFormik.errors.url}
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  id="geturl"
                  name="geturl"
                  label="Default Get URL"
                  value={settingsFormik.values.geturl}
                  onChange={settingsFormik.handleChange}
                  error={settingsFormik.touched.geturl && Boolean(settingsFormik.errors.geturl)}
                  helperText={settingsFormik.touched.geturl && settingsFormik.errors.geturl}
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  id="delcategory"
                  name="delcategory"
                  label="Default Delete Category"
                  value={settingsFormik.values.delcategory}
                  onChange={settingsFormik.handleChange}
                  error={settingsFormik.touched.delcategory && Boolean(settingsFormik.errors.delcategory)}
                  helperText={settingsFormik.touched.delcategory && settingsFormik.errors.delcategory}
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  id="date"
                  name="date"
                  label="Default Date"
                  type="number"
                  value={settingsFormik.values.date}
                  onChange={settingsFormik.handleChange}
                  error={settingsFormik.touched.date && Boolean(settingsFormik.errors.date)}
                  helperText={settingsFormik.touched.date && settingsFormik.errors.date}
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  id="cron"
                  name="cron"
                  label="Default Cron"
                  type="number"
                  value={settingsFormik.values.cron}
                  onChange={settingsFormik.handleChange}
                  error={settingsFormik.touched.cron && Boolean(settingsFormik.errors.cron)}
                  helperText={settingsFormik.touched.cron && settingsFormik.errors.cron}
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  id="cjnum"
                  name="cjnum"
                  label="Default CJ Num"
                  type="number"
                  value={settingsFormik.values.cjnum}
                  onChange={settingsFormik.handleChange}
                  error={settingsFormik.touched.cjnum && Boolean(settingsFormik.errors.cjnum)}
                  helperText={settingsFormik.touched.cjnum && settingsFormik.errors.cjnum}
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settingsFormik.values.open}
                        onChange={(e) => settingsFormik.setFieldValue('open', e.target.checked)}
                        name="open"
                      />
                    }
                    label="Default Active"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settingsFormik.values.ism3u8}
                        onChange={(e) => settingsFormik.setFieldValue('ism3u8', e.target.checked)}
                        name="ism3u8"
                      />
                    }
                    label="Default Is M3U8"
                  />
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseSettingsDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {settingsFormik.isSubmitting ? <CircularProgress size={24} /> : 'Save Settings'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this Maccms entry? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MaccmsPage;
