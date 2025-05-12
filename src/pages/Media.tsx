import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch, 
  Tooltip,
  Pagination
} from '@mui/material';
import Grid from '@mui/material/Grid';


import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Movie as MovieIcon,
  Book as BookIcon,
  MenuBook as NovelIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { getMediaList, createMedia, updateMedia, deleteMedia } from '../services/mediaService';
import { Media, MediaType, MediaStatus, MediaFilterParams } from '../types';
import { useNavigate } from 'react-router-dom';

const validationSchema = Yup.object({
  mediaType: Yup.string().oneOf(['ANIME', 'MANGA', 'NOVEL']).required('Media type is required'),
  originalTitle: Yup.string().required('Original title is required'),
  status: Yup.string().oneOf(['pending', 'approved', 'hidden']).required('Status is required'),
  year: Yup.number().min(1900).max(new Date().getFullYear() + 5).required('Year is required'),
  episodes: Yup.number().min(0).required('Number of episodes is required'),
});

const MediaList: React.FC = () => {
  const navigate = useNavigate();
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingMedia, setEditingMedia] = useState<Media | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [mediaToDelete, setMediaToDelete] = useState<Media | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [tabValue, setTabValue] = useState<MediaType | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters] = useState<MediaFilterParams>({
    limit: 10,
    page: 1,
    sort: 'createdAt:desc'
  });

  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      const params: MediaFilterParams = {
        ...filters,
        page
      };
      
      if (tabValue !== 'ALL') {
        params.mediaType = tabValue;
      }
      
      const response = await getMediaList(params);
      setMediaList(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching media:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch media',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [filters, page, tabValue, setLoading, setMediaList, setTotalPages, setSnackbar]);

  useEffect(() => {
    fetchMedia();
  }, [page, tabValue, filters, fetchMedia]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: MediaType | 'ALL') => {
    setTabValue(newValue);
    setPage(1);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const formik = useFormik({
    initialValues: {
      mediaType: 'ANIME' as MediaType,
      originalTitle: '',
      year: new Date().getFullYear(),
      episodes: 0,
      duration: 0,
      status: 'pending' as MediaStatus,
      isOngoing: false,
      tags: [] as string[],
      tagsInput: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const mediaData: Partial<Media> = {
          mediaType: values.mediaType,
          originalTitle: values.originalTitle,
          year: values.year,
          episodes: values.episodes,
          duration: values.duration,
          status: values.status,
          isOngoing: values.isOngoing,
          tags: values.tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag),
        };
        
        if (editingMedia) {
          // Update existing media
          await updateMedia(editingMedia._id, mediaData);
          setSnackbar({
            open: true,
            message: 'Media updated successfully',
            severity: 'success',
          });
        } else {
          // Create new media
          await createMedia(mediaData);
          setSnackbar({
            open: true,
            message: 'Media created successfully',
            severity: 'success',
          });
        }
        
        resetForm();
        setOpenDialog(false);
        setEditingMedia(null);
        fetchMedia();
      } catch (error: any) {
        console.error('Error saving media:', error);
        setSnackbar({
          open: true,
          message: error.message || 'Failed to save media',
          severity: 'error',
        });
      }
    },
  });

  const handleOpenDialog = (media?: Media) => {
    if (media) {
      setEditingMedia(media);
      formik.setValues({
        mediaType: media.mediaType,
        originalTitle: media.originalTitle,
        year: media.year,
        episodes: media.episodes,
        duration: media.duration || 0,
        status: media.status,
        isOngoing: media.isOngoing,
        tags: media.tags || [],
        tagsInput: media.tags ? media.tags.join(', ') : '',
      });
    } else {
      setEditingMedia(null);
      formik.resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMedia(null);
    formik.resetForm();
  };

  const handleDeleteClick = (media: Media) => {
    setMediaToDelete(media);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!mediaToDelete) return;
    
    try {
      await deleteMedia(mediaToDelete._id);
      setSnackbar({
        open: true,
        message: 'Media deleted successfully',
        severity: 'success',
      });
      fetchMedia();
    } catch (error) {
      console.error('Error deleting media:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete media',
        severity: 'error',
      });
    } finally {
      setDeleteConfirmOpen(false);
      setMediaToDelete(null);
    }
  };

  const handleViewDetails = (mediaId: string) => {
    navigate(`/media/${mediaId}`);
  };

  const getMediaTypeIcon = (type: MediaType) => {
    switch (type) {
      case 'ANIME':
        return <MovieIcon />;
      case 'MANGA':
        return <BookIcon />;
      case 'NOVEL':
        return <NovelIcon />;
      default:
        return <MovieIcon />;
    }
  };

  const getStatusColor = (status: MediaStatus) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'hidden':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Media Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Media
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="All" value="ALL" />
          <Tab label="Anime" value="ANIME" />
          <Tab label="Manga" value="MANGA" />
          <Tab label="Novel" value="NOVEL" />
        </Tabs>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {mediaList.length > 0 ? (
              mediaList.map((media) => (
                <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={media._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia
                      component="div"
                      sx={{
                        height: 140,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      {getMediaTypeIcon(media.mediaType)}
                    </CardMedia>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Grid container>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography gutterBottom variant="h6" component="div" noWrap>
                            {media.originalTitle}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                        <Chip
                          size="small"
                          label={media.mediaType}
                          color="primary"
                        />
                        <Chip
                          size="small"
                          label={media.status}
                          color={getStatusColor(media.status)}
                        />
                        {media.isOngoing && (
                          <Chip
                            size="small"
                            label="Ongoing"
                            color="info"
                          />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Year: {media.year}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Episodes: {media.episodes}
                      </Typography>
                      {media.tags && media.tags.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Tags: {media.tags.slice(0, 3).join(', ')}
                            {media.tags.length > 3 && '...'}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                    <CardActions>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewDetails(media._id)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(media)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(media)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1">No media found</Typography>
                </Paper>
              </Grid>
            )}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Media Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {editingMedia ? 'Edit Media' : 'Add New Media'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel id="mediaType-label">Media Type</InputLabel>
                  <Select
                    labelId="mediaType-label"
                    id="mediaType"
                    name="mediaType"
                    value={formik.values.mediaType}
                    onChange={formik.handleChange}
                    label="Media Type"
                  >
                    <MenuItem value="ANIME">Anime</MenuItem>
                    <MenuItem value="MANGA">Manga</MenuItem>
                    <MenuItem value="NOVEL">Novel</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    id="status"
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    label="Status"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="hidden">Hidden</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  id="originalTitle"
                  name="originalTitle"
                  label="Original Title"
                  value={formik.values.originalTitle}
                  onChange={formik.handleChange}
                  error={formik.touched.originalTitle && Boolean(formik.errors.originalTitle)}
                  helperText={formik.touched.originalTitle && formik.errors.originalTitle}
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  id="year"
                  name="year"
                  label="Year"
                  type="number"
                  value={formik.values.year}
                  onChange={formik.handleChange}
                  error={formik.touched.year && Boolean(formik.errors.year)}
                  helperText={formik.touched.year && formik.errors.year}
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  id="episodes"
                  name="episodes"
                  label="Episodes"
                  type="number"
                  value={formik.values.episodes}
                  onChange={formik.handleChange}
                  error={formik.touched.episodes && Boolean(formik.errors.episodes)}
                  helperText={formik.touched.episodes && formik.errors.episodes}
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  id="duration"
                  name="duration"
                  label="Duration (minutes)"
                  type="number"
                  value={formik.values.duration}
                  onChange={formik.handleChange}
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  id="tagsInput"
                  name="tagsInput"
                  label="Tags (comma separated)"
                  value={formik.values.tagsInput}
                  onChange={formik.handleChange}
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.isOngoing}
                      onChange={(e) => formik.setFieldValue('isOngoing', e.target.checked)}
                      name="isOngoing"
                    />
                  }
                  label="Ongoing Series"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {formik.isSubmitting ? <CircularProgress size={24} /> : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{mediaToDelete?.originalTitle}"? This action cannot be undone.
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

export default MediaList;
