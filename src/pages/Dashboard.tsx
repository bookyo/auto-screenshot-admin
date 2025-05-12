import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress
} from '@mui/material';
import { 
  PeopleAlt as PeopleIcon, 
  Movie as MovieIcon, 
  Storage as StorageIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { getUsers } from '../services/userService';
import { getMediaList } from '../services/mediaService';
import { getMaccmsList } from '../services/maccmsService';
import { Media } from '../types';

const Dashboard: React.FC = () => {
  const [usersCount, setUsersCount] = useState<number>(0);
  const [mediaCount, setMediaCount] = useState<number>(0);
  const [maccmsCount, setMaccmsCount] = useState<number>(0);
  const [recentMedia, setRecentMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch users count
        const users = await getUsers();
        setUsersCount(users.length);
        
        // Fetch media with pagination
        const mediaResponse = await getMediaList({ limit: 5, sort: 'createdAt:desc' });
        setMediaCount(mediaResponse.total);
        setRecentMedia(mediaResponse.data);
        
        // Fetch maccms count
        const maccms = await getMaccmsList();
        setMaccmsCount(maccms.length);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, count, icon, color }: { title: string; count: number; icon: React.ReactNode; color: string }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" component="div" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h3" component="div" sx={{ mt: 1, fontWeight: 'bold' }}>
              {count}
            </Typography>
          </Box>
          <Box sx={{ 
            backgroundColor: `${color}20`, 
            p: 2, 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Box sx={{ color }}>
              {icon}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Total Users" 
            count={usersCount} 
            icon={<PeopleIcon fontSize="large" />} 
            color="#3f51b5"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Total Media" 
            count={mediaCount} 
            icon={<MovieIcon fontSize="large" />} 
            color="#f50057"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Maccms Entries" 
            count={maccmsCount} 
            icon={<StorageIcon fontSize="large" />} 
            color="#ff9800"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Total Views" 
            count={recentMedia.reduce((sum, media) => sum + media.pv, 0)} 
            icon={<TrendingUpIcon fontSize="large" />} 
            color="#4caf50"
          />
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Recent Media
            </Typography>
            <List>
              {recentMedia.length > 0 ? (
                recentMedia.map((media, index) => (
                  <React.Fragment key={media._id}>
                    <ListItem>
                      <ListItemText
                        primary={media.originalTitle}
                        secondary={`Type: ${media.mediaType} | Status: ${media.status} | Episodes: ${media.episodes}`}
                      />
                    </ListItem>
                    {index < recentMedia.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No media entries found" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Media Status
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-around', 
              alignItems: 'center',
              height: '80%'
            }}>
              {/* This would be a chart in a real implementation */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Pending
                </Typography>
                <Typography variant="h5">
                  {recentMedia.filter(m => m.status === 'pending').length}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Approved
                </Typography>
                <Typography variant="h5">
                  {recentMedia.filter(m => m.status === 'approved').length}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Hidden
                </Typography>
                <Typography variant="h5">
                  {recentMedia.filter(m => m.status === 'hidden').length}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
