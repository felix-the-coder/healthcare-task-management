import React from "react";
import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Tooltip,
    Divider,
    IconButton,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import TaskIcon from "@mui/icons-material/Task";
import PeopleIcon from "@mui/icons-material/People";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogIcon from "@mui/icons-material/Article";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

const Sidebar = ({ isExpanded, onToggleSidebar, userRole, onMenuClick }) => {
    // Define role-specific links
    const roleLinks = {
        administrator: [
            { text: "Tasks", icon: <TaskIcon />, component: "Tasks" },
            { text: "Patients", icon: <PeopleIcon />, component: "Patients" },
            { text: "Dashboard", icon: <NotificationsIcon />, component: "Dashboard" },
            { text: "Logs", icon: <LogIcon />, component: "Logs" },
            { text: "Staff Management", icon: <AdminPanelSettingsIcon />, component: "Staff" },
        ],
        doctor: [
            { text: "Assigned Tasks", icon: <TaskIcon />, component: "Tasks" },
            { text: "Patients", icon: <PeopleIcon />, component: "Patients" },
            { text: "Dashboard", icon: <NotificationsIcon />, component: "Dashboard" },
        ],
        nurse: [
            { text: "Assigned Tasks", icon: <TaskIcon />, component: "Tasks" },
            { text: "Patients", icon: <PeopleIcon />, component: "Patients" },
            { text: "Dashboard", icon: <NotificationsIcon />, component: "Dashboard" },
        ],
    };

    // Get links for the current user role
    const links = roleLinks[userRole] || [];

    return (
        <Drawer
            variant="permanent"
            sx={{
                "& .MuiDrawer-paper": {
                    width: isExpanded ? 300 : 70,
                    transition: "width 0.3s",
                    backgroundColor: "background.paper",
                    color: "text.primary",
                },
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: isExpanded ? "space-between" : "center",
                    padding: "10px",
                }}
            >
                {isExpanded && <h3 style={{ margin: 0 }}>Menu</h3>}
                <IconButton onClick={onToggleSidebar}>
                    {isExpanded ? <ChevronLeftIcon /> : <ChevronLeftIcon />}
                </IconButton>
            </div>
            <Divider />
            <List>
                {links.map((link, index) => (
                    <Tooltip
                        title={link.text}
                        placement="right"
                        disableHoverListener={isExpanded}
                        key={index}
                    >
                        <ListItem
                            button
                            component="a"
                            onClick={()=> onMenuClick(link.component)}

                            sx={{
                                display: "flex",
                                justifyContent: isExpanded ? "flex-start" : "center",
                                padding: isExpanded ? "10px 16px" : "10px",
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    color: "text.primary",
                                    minWidth: "auto",
                                    marginRight: isExpanded ? 16 : 0,
                                }}
                            >
                                {link.icon}
                            </ListItemIcon>
                            {isExpanded && <ListItemText sx={{color: "text.primary"}} primary={link.text} />}
                        </ListItem>
                    </Tooltip>
                ))}
            </List>
        </Drawer>
    );
};

export default Sidebar;
