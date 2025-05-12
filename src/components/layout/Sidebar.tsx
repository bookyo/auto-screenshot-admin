import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Box, 
  Typography 
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Movie as MovieIcon,
  Settings as SettingsIcon,
  Storage as StorageIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;

interface MenuItem {
  text: string;
  path: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const menuItems: MenuItem[] = [
  {
    text: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />
  },
  {
    text: 'Users',
    path: '/users',
    icon: <PeopleIcon />,
    adminOnly: true
  },
  {
    text: 'Media',
    path: '/media',
    icon: <MovieIcon />
  },
  {
    text: 'Maccms',
    path: '/maccms',
    icon: <StorageIcon />
  },
  {
    text: 'Settings',
    path: '/settings',
    icon: <SettingsIcon />,
    adminOnly: true
  }
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#1a1a2e',
          color: 'white'
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          Auto-Screenshot Admin
        </Typography>
      </Box>
      <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
      <List>
        {menuItems
          .filter(item => !item.adminOnly || isAdmin)
          .map((item) => (
            <ListItem
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.05)'
                }
              }}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
