import React, { useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import type { Theme, CSSObject } from '@mui/material';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import type { AppBarProps as MuiAppBarProps } from '@mui/material';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import LogoutIcon from '@mui/icons-material/Logout';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonalInjuryIcon from '@mui/icons-material/PersonalInjury';
import Collapse from '@mui/material/Collapse';
import { useNavigate } from 'react-router-dom';
import { LocalHospital } from '@mui/icons-material';
import SettingsIcon from '@mui/icons-material/Settings';

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

interface SidebarLayoutProps {
  children: React.ReactNode;
}

interface OpenState {
  compras: boolean;
  stock: boolean;
  ventas: boolean;
  caja: boolean;
  remisiones: boolean;
  cobranzas: boolean;
  pedidoInterno: boolean;
  sanatorio: boolean;
}

interface SubMenuItem {
  text: string;
  path: string;
  icon?: React.ReactNode;
}

interface MenuItem {
  text: string;
  path?: string;
  icon: React.ReactNode;
  subItems?: SubMenuItem[];
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(true);
  const [openSubMenus, setOpenSubMenus] = useState<{ [key: string]: boolean }>({});
  const navigate = useNavigate();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleLogout = () => {
    // Limpiar localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // Redirigir al login
    navigate('/login');
  };

  const handleSubMenuToggle = (menuText: string) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [menuText]: !prev[menuText],
    }));
  };

  const menuItems: MenuItem[] = [
    {
      text: 'Facturación',
      path: '/facturacion',
      icon: <ReceiptIcon />
    },
    {
      text: 'Clientes',
      icon: <BusinessIcon />,
      subItems: [
        { text: 'Pedidos', path: '/pedidos', icon: <ReceiptLongIcon /> }
      ]
    },
    {
      text: 'ABM',
      icon: <InboxIcon />,
      subItems: [
        { text: 'Persona-Entidad', path: '/abm/personas', icon: <PeopleIcon /> },
        { text: 'Productos', path: '/abm/productos', icon: <InventoryIcon /> },
      ]
    },
    {
      text: 'Cobranzas',
      icon: <AttachMoneyIcon />,
      subItems: [
        { text: 'Precobranza', path: '/cobranzas/precobranza', icon: <ReceiptLongIcon /> },
        { text: 'Cobranza', path: '/cobranzas/cobranza', icon: <RequestQuoteIcon /> },
      ]
    },
    {
      text: 'Compras',
      path: '/compras',
      icon: <ShoppingCartIcon />
    },
    {
      text: 'Sucursales',
      icon: <BusinessIcon />, // Reusing BusinessIcon or finding another one like StoreIcon if available, but BusinessIcon is imported.
      subItems: [
        { text: 'Remisiones', path: '/remisiones', icon: <ReceiptIcon /> }, // Reusing ReceiptIcon
        { text: 'Recepciones Pendientes', path: '/recepciones-pendientes', icon: <InventoryIcon /> },
      ]
    },
    {
      text: 'Pedido Interno',
      icon: <RequestQuoteIcon />,
      subItems: [
        { text: 'Generar Pedido', path: '/pedido-interno/generar', icon: <ReceiptIcon /> },
        { text: 'Consulta Pedido', path: '/pedido-interno/consulta', icon: <ReceiptLongIcon /> },
      ]
    },
    {
      text: 'Mercaderia',
      icon: <InventoryIcon />,
      subItems: [
        { text: 'Ajustes', path: '/mercaderia/ajustes', icon: <InventoryIcon /> },
      ]
    },
    {
      text: 'Sanatorio',
      icon: <LocalHospital />,
      subItems: [
        { text: 'Pacientes', path: '/sanatorio/pacientes', icon: <PersonalInjuryIcon /> },
        { text: 'Funcionarios', path: '/sanatorio/funcionarios', icon: <PeopleIcon /> },
      ]
    },
    {
      text: 'Auditoría',
      path: '/auditoria',
      icon: <ReceiptLongIcon /> // Using ReceiptLongIcon as a placeholder for Audit log
    },
    {
      text: 'Administración',
      icon: <SettingsIcon />, // Changed to SettingsIcon
      subItems: [
        { text: 'Roles', path: '/administracion/roles', icon: <PeopleIcon /> },
        { text: 'Usuarios', path: '/administracion/usuarios', icon: <PeopleIcon /> },
        { text: 'Terminales', path: '/administracion/terminales', icon: <InventoryIcon /> },
      ]
    },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Sistema Cúrcuma
          </Typography>
          <IconButton
            color="inherit"
            onClick={handleLogout}
            aria-label="cerrar sesión"
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <React.Fragment key={item.text}>
              <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  onClick={() => {
                    if (item.subItems) {
                      handleSubMenuToggle(item.text);
                    } else if (item.path) {
                      navigate(item.path);
                    }
                  }}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
                  {item.subItems && open && (
                    openSubMenus[item.text] ? <ExpandLess /> : <ExpandMore />
                  )}
                </ListItemButton>
              </ListItem>

              {/* Submenú desplegable */}
              {item.subItems && (
                <Collapse in={openSubMenus[item.text]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems.map((subItem) => (
                      <ListItem key={subItem.text} disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                          onClick={() => navigate(subItem.path)}
                          sx={{
                            minHeight: 48,
                            justifyContent: open ? 'initial' : 'center',
                            pl: 4,
                            px: 2.5,
                          }}
                        >
                          {subItem.icon && (
                            <ListItemIcon
                              sx={{
                                minWidth: 0,
                                mr: open ? 3 : 'auto',
                                justifyContent: 'center',
                              }}
                            >
                              {subItem.icon}
                            </ListItemIcon>
                          )}
                          <ListItemText primary={subItem.text} sx={{ opacity: open ? 1 : 0 }} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        {children}
      </Box>
    </Box>
  );
}