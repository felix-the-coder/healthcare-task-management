import React, { useState } from "react";
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Box } from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom"; // Import for redirection

const Navbar = ({ isSidebarExpanded }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleMenuClose();
        localStorage.removeItem("jwt_token"); // Remove JWT token
        localStorage.removeItem("userData"); // Remove user data
        navigate("/"); // Redirect to login page
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                width: isSidebarExpanded ? `calc(100% - 300px)` : `calc(100% - 70px)`,
                marginLeft: isSidebarExpanded ? "250px" : "70px",
                transition: "width 0.3s, margin-left 0.3s",
                backgroundColor: "primary.main",
            }}
        >
            <Toolbar>
                {/* Left Section: Logo and App Name */}
                <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
                    <img
                        src="/logo.png"
                        alt="Logo"
                        style={{
                            height: "40px",
                            marginRight: "10px",
                        }}
                    />
                    <Typography variant="h6" noWrap>
                        Healthcare Management
                    </Typography>
                </Box>

                {/* Right Section: User Dropdown */}
                <Box>
                    <IconButton
                        color="inherit"
                        onClick={handleMenuOpen}
                        aria-controls="user-menu"
                        aria-haspopup="true"
                    >
                        <AccountCircle />
                    </IconButton>
                    <Menu
                        id="user-menu"
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        anchorOrigin={{
                            vertical: "top",
                            horizontal: "right",
                        }}
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "right",
                        }}
                    >
                        <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
