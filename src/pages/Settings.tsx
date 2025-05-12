import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  apiUrl: Yup.string().url('Must be a valid URL').required('API URL is required'),
  screenshotsPerPage: Yup.number().min(1, 'Must be at least 1').required('Required'),
  defaultLanguage: Yup.string().required('Default language is required'),
});

const Settings: React.FC = () => {
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const formik = useFormik({
    initialValues: {
      apiUrl: localStorage.getItem('apiUrl') || 'http://localhost:3001',
      screenshotsPerPage: Number(localStorage.getItem('screenshotsPerPage')) || 20,
      defaultLanguage: localStorage.getItem('defaultLanguage') || 'en',
      darkMode: localStorage.getItem('darkMode') === 'true',
      autoRefresh: localStorage.getItem('autoRefresh') === 'true',
      refreshInterval: Number(localStorage.getItem('refreshInterval')) || 60,
    },
    validationSchema,
    onSubmit: (values) => {
      // Save settings to localStorage
      localStorage.setItem('apiUrl', values.apiUrl);
      localStorage.setItem('screenshotsPerPage', String(values.screenshotsPerPage));
      localStorage.setItem('defaultLanguage', values.defaultLanguage);
      localStorage.setItem('darkMode', String(values.darkMode));
      localStorage.setItem('autoRefresh', String(values.autoRefresh));
      localStorage.setItem('refreshInterval', String(values.refreshInterval));
      
      setSnackbar({
        open: true,
        message: 'Settings saved successfully',
        severity: 'success',
      });
    },
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardHeader title="General Settings" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      id="apiUrl"
                      name="apiUrl"
                      label="API URL"
                      value={formik.values.apiUrl}
                      onChange={formik.handleChange}
                      error={formik.touched.apiUrl && Boolean(formik.errors.apiUrl)}
                      helperText={formik.touched.apiUrl && formik.errors.apiUrl}
                    />
                  </Grid>
                  
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      id="defaultLanguage"
                      name="defaultLanguage"
                      label="Default Language"
                      value={formik.values.defaultLanguage}
                      onChange={formik.handleChange}
                      error={formik.touched.defaultLanguage && Boolean(formik.errors.defaultLanguage)}
                      helperText={formik.touched.defaultLanguage && formik.errors.defaultLanguage}
                    />
                  </Grid>
                  
                  <Grid size={{ xs: 12 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formik.values.darkMode}
                          onChange={(e) => formik.setFieldValue('darkMode', e.target.checked)}
                          name="darkMode"
                        />
                      }
                      label="Dark Mode"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardHeader title="Display Settings" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      id="screenshotsPerPage"
                      name="screenshotsPerPage"
                      label="Screenshots Per Page"
                      type="number"
                      value={formik.values.screenshotsPerPage}
                      onChange={formik.handleChange}
                      error={formik.touched.screenshotsPerPage && Boolean(formik.errors.screenshotsPerPage)}
                      helperText={formik.touched.screenshotsPerPage && formik.errors.screenshotsPerPage}
                    />
                  </Grid>
                  
                  <Grid size={{ xs: 12 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formik.values.autoRefresh}
                          onChange={(e) => formik.setFieldValue('autoRefresh', e.target.checked)}
                          name="autoRefresh"
                        />
                      }
                      label="Auto Refresh"
                    />
                  </Grid>
                  
                  {formik.values.autoRefresh && (
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        id="refreshInterval"
                        name="refreshInterval"
                        label="Refresh Interval (seconds)"
                        type="number"
                        value={formik.values.refreshInterval}
                        onChange={formik.handleChange}
                      />
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? <CircularProgress size={24} /> : 'Save Settings'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
      
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

export default Settings;
