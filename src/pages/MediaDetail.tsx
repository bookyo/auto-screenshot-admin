import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, 
  Typography, 
  Paper, 
  Chip, 
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
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  ImageList, 
  ImageListItem
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ArrowBack as ArrowBackIcon,
  Image as ImageIcon,
  Videocam as VideoIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { getMediaById, updateEpisode, addEpisode, deleteEpisode } from '../services/mediaService';
import { Media, Episode } from '../types';

const episodeValidationSchema = Yup.object({
  episode: Yup.string().required('Episode identifier is required'),
  video: Yup.string().url('Must be a valid URL'),
});

const MediaDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [media, setMedia] = useState<Media | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [episodeToDelete, setEpisodeToDelete] = useState<Episode | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [screenshotInput, setScreenshotInput] = useState('');

  const fetchMedia = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const mediaData = await getMediaById(id);
      setMedia(mediaData);
    } catch (error) {
      console.error('Error fetching media details:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch media details',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [id, setLoading, setMedia, setSnackbar]);

  useEffect(() => {
    fetchMedia();
  }, [id, fetchMedia]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formik = useFormik({
    initialValues: {
      episode: '',
      video: '',
      screenshots: [] as string[],
    },
    validationSchema: episodeValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!id) return;
      
      try {
        const episodeData: Episode = {
          episode: values.episode,
          video: values.video,
          screenshots: values.screenshots,
        };
        
        if (editingEpisode && editingEpisode._id) {
          // Update existing episode
          await updateEpisode(id, editingEpisode._id, episodeData);
          setSnackbar({
            open: true,
            message: 'Episode updated successfully',
            severity: 'success',
          });
        } else {
          // Add new episode
          await addEpisode(id, episodeData);
          setSnackbar({
            open: true,
            message: 'Episode added successfully',
            severity: 'success',
          });
        }
        
        resetForm();
        setOpenDialog(false);
        setEditingEpisode(null);
        fetchMedia();
      } catch (error: any) {
        console.error('Error saving episode:', error);
        setSnackbar({
          open: true,
          message: error.message || 'Failed to save episode',
          severity: 'error',
        });
      }
    },
  });

  const handleOpenDialog = (episode?: Episode) => {
    if (episode) {
      setEditingEpisode(episode);
      formik.setValues({
        episode: episode.episode,
        video: episode.video || '',
        screenshots: episode.screenshots || [],
      });
    } else {
      setEditingEpisode(null);
      formik.resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEpisode(null);
    formik.resetForm();
  };

  const handleDeleteClick = (episode: Episode) => {
    setEpisodeToDelete(episode);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!id || !episodeToDelete || !episodeToDelete._id) return;
    
    try {
      await deleteEpisode(id, episodeToDelete._id);
      setSnackbar({
        open: true,
        message: 'Episode deleted successfully',
        severity: 'success',
      });
      fetchMedia();
    } catch (error) {
      console.error('Error deleting episode:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete episode',
        severity: 'error',
      });
    } finally {
      setDeleteConfirmOpen(false);
      setEpisodeToDelete(null);
    }
  };

  const handleAddScreenshot = () => {
    if (!screenshotInput.trim()) return;
    
    const screenshots = [...formik.values.screenshots, screenshotInput.trim()];
    formik.setFieldValue('screenshots', screenshots);
    setScreenshotInput('');
  };

  const handleRemoveScreenshot = (index: number) => {
    const screenshots = [...formik.values.screenshots];
    screenshots.splice(index, 1);
    formik.setFieldValue('screenshots', screenshots);
  };

  const getStatusColor = (status: string) => {
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!media) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography variant="h5" color="error">Media not found</Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/media')}
          sx={{ mt: 2 }}
        >
          Back to Media List
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/media')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          Media Details
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h5" gutterBottom>
              {media.originalTitle}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip
                label={media.mediaType}
                color="primary"
              />
              <Chip
                label={media.status}
                color={getStatusColor(media.status)}
              />
              {media.isOngoing && (
                <Chip
                  label="Ongoing"
                  color="info"
                />
              )}
            </Box>
            
            <Typography variant="body1" paragraph>
              <strong>Year:</strong> {media.year}
            </Typography>
            
            <Typography variant="body1" paragraph>
              <strong>Episodes:</strong> {media.episodes}
              {media.duration > 0 && ` (${media.duration} min each)`}
            </Typography>
            
            {media.tags && media.tags.length > 0 && (
              <Typography variant="body1" paragraph>
                <strong>Tags:</strong> {media.tags.join(', ')}
              </Typography>
            )}
            
            <Typography variant="body1">
              <strong>Created:</strong> {new Date(media.createdAt).toLocaleDateString()}
            </Typography>
            
            <Typography variant="body1">
              <strong>Last Updated:</strong> {new Date(media.updatedAt).toLocaleDateString()}
            </Typography>
          </Grid>
          
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Episodes
                    </Typography>
                    <Typography variant="h5">
                      {media.episodesList?.length || 0}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Page Views
                    </Typography>
                    <Typography variant="h5">
                      {media.pv || 0}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Rating
                    </Typography>
                    <Typography variant="h5">
                      {media.averageRating || 0}/10
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          Episodes
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Episode
        </Button>
      </Box>

      {media.episodesList && media.episodesList.length > 0 ? (
        <List>
          {media.episodesList.map((episode, index) => (
            <Accordion key={episode._id || index}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`episode-${index}-content`}
                id={`episode-${index}-header`}
              >
                <Typography sx={{ width: '33%', flexShrink: 0 }}>
                  Episode: {episode.episode}
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>
                  {episode.screenshots?.length || 0} screenshots
                  {episode.video ? ' | Has video' : ''}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {episode.video && (
                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <VideoIcon sx={{ mr: 1 }} />
                        <Typography variant="body1" component="a" href={'https://api.reelbit.cc' + episode.video.replace('./public', '')} target="_blank" rel="noopener noreferrer">
                          {episode.video}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  
                  {episode.screenshots && episode.screenshots.length > 0 && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Screenshots:
                      </Typography>
                      <ImageList cols={3} gap={8}>
                        {episode.screenshots.map((screenshot, idx) => (
                          <ImageListItem key={idx}>
                            <img
                              src={'https://api.reelbit.cc' + screenshot.replace('public', '')}
                              alt={`Screenshot ${idx + 1}`}
                              loading="lazy"
                              style={{ maxHeight: '200px', objectFit: 'cover' }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Image+Error';
                              }}
                            />
                          </ImageListItem>
                        ))}
                      </ImageList>
                    </Grid>
                  )}
                  
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenDialog(episode)}
                        sx={{ mr: 1 }}
                      >
                        Edit
                      </Button>
                      <Button
                        startIcon={<DeleteIcon />}
                        color="error"
                        onClick={() => handleDeleteClick(episode)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </List>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">No episodes found</Typography>
        </Paper>
      )}

      {/* Episode Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {editingEpisode ? 'Edit Episode' : 'Add New Episode'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  id="episode"
                  name="episode"
                  label="Episode Identifier"
                  value={formik.values.episode}
                  onChange={formik.handleChange}
                  error={formik.touched.episode && Boolean(formik.errors.episode)}
                  helperText={formik.touched.episode && formik.errors.episode}
                  placeholder="e.g., S01E01, Episode 1, Chapter 1"
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  id="video"
                  name="video"
                  label="Video URL"
                  value={formik.values.video}
                  onChange={formik.handleChange}
                  error={formik.touched.video && Boolean(formik.errors.video)}
                  helperText={formik.touched.video && formik.errors.video}
                  placeholder="https://example.com/video.mp4"
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Screenshots
                </Typography>
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Screenshot URL"
                    value={screenshotInput}
                    onChange={(e) => setScreenshotInput(e.target.value)}
                    placeholder="https://example.com/screenshot.jpg"
                    sx={{ mr: 1 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddScreenshot}
                    disabled={!screenshotInput.trim()}
                  >
                    Add
                  </Button>
                </Box>
                
                <List dense>
                  {formik.values.screenshots.map((screenshot, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ImageIcon sx={{ mr: 1, fontSize: 16 }} />
                            <Typography variant="body2" noWrap>
                              {screenshot}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleRemoveScreenshot(index)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                  {formik.values.screenshots.length === 0 && (
                    <ListItem>
                      <ListItemText primary="No screenshots added" />
                    </ListItem>
                  )}
                </List>
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
            Are you sure you want to delete episode "{episodeToDelete?.episode}"? This action cannot be undone.
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

export default MediaDetail;
