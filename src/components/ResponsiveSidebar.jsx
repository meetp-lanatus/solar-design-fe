import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  LocationOn as LocationIcon,
  Logout as LogoutIcon,
  People as PeopleIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

const menuItems = [
  {
    text: 'Sites',
    icon: <LocationIcon />,
    path: '/',
  },
  {
    text: 'Customers',
    icon: <PeopleIcon />,
    path: '/customers',
  },
];

export const ResponsiveSidebar = ({ user, collapsed, onToggle, isMobile, onMobileClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth/signin');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'grey.200',
      }}
    >
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: 64,
        }}
      >
        {!collapsed && (
          <Typography
            variant='h6'
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              fontSize: '1.25rem',
            }}
          >
            Solar Designer
          </Typography>
        )}
        <IconButton
          onClick={onToggle}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'grey.100',
            },
          }}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>

      <Divider />

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List sx={{ px: 1, py: 2 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                {collapsed ? (
                  <Tooltip title={item.text} placement='right'>
                    <ListItemButton
                      onClick={() => handleNavigation(item.path)}
                      sx={{
                        minHeight: 48,
                        justifyContent: 'center',
                        borderRadius: 2,
                        backgroundColor: isActive ? 'primary.main' : 'transparent',
                        color: isActive ? 'primary.contrastText' : 'text.secondary',
                        '&:hover': {
                          backgroundColor: isActive ? 'primary.dark' : 'grey.100',
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          color: isActive ? 'primary.contrastText' : 'text.secondary',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                    </ListItemButton>
                  </Tooltip>
                ) : (
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: isActive ? 'primary.main' : 'transparent',
                      color: isActive ? 'primary.contrastText' : 'text.secondary',
                      '&:hover': {
                        backgroundColor: isActive ? 'primary.dark' : 'grey.100',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive ? 'primary.contrastText' : 'text.secondary',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontWeight: isActive ? 600 : 500,
                        },
                      }}
                    />
                  </ListItemButton>
                )}
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        {collapsed ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Tooltip title={user?.name || 'User'} placement='right'>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                {getInitials(user?.name)}
              </Avatar>
            </Tooltip>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              {getInitials(user?.name)}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography
                variant='subtitle2'
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.name || 'User'}
              </Typography>
              <Typography
                variant='caption'
                sx={{
                  color: 'text.secondary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                }}
              >
                {user?.email || 'user@example.com'}
              </Typography>
            </Box>
          </Box>
        )}

        <List sx={{ mt: 1 }}>
          <ListItem disablePadding>
            {collapsed ? (
              <Tooltip title='Logout' placement='right'>
                <ListItemButton
                  onClick={handleLogout}
                  sx={{
                    minHeight: 48,
                    justifyContent: 'center',
                    borderRadius: 2,
                    color: 'text.secondary',
                    '&:hover': {
                      backgroundColor: 'grey.100',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0, color: 'text.secondary' }}>
                    <LogoutIcon />
                  </ListItemIcon>
                </ListItemButton>
              </Tooltip>
            ) : (
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  borderRadius: 2,
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'grey.100',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'text.secondary' }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary='Logout' />
              </ListItemButton>
            )}
          </ListItem>
        </List>
      </Box>
    </Box>
  );
};
