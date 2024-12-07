import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../css/theme';
import Sidebar from '../components/Sidebar';
import StaffManagement from '../components/StaffManagement';
import PatientDetails from '../components/PatientDetails';
import TaskDetails from '../components/TaskDetails';
import LogDetails from '../components/LogDetails';
import TaskDashboard from '../components/TaskDashboard';

const AdminDashboard = () => {
    const [activeComponent, setActiveComponent] = useState('DashboardHome');
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

    // Simulate user role; this would typically come from authentication logic
    const userRole = "administrator"; // Change to "staff" or "auditor" for testing

    // Function to handle sidebar item clicks
    const handleSidebarClick = (component) => {
        setActiveComponent(component);
    };

    // Render the selected component
    const renderComponent = () => {
        switch (activeComponent) {
            case "Staff":
                return <StaffManagement />;
            case "Patients":
                return <PatientDetails />;
            case "Tasks":
                return <TaskDetails />;
            case "Dashboard":
                return <TaskDashboard />;
            case "Logs":
                return <LogDetails />;
            case "DashboardHome":
            default:
                return <TaskDashboard />;
        }
      };

    const toggleSidebar = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };
    return(
        <ThemeProvider theme = {theme}>
             <div style={{ display: "flex" }}>
            {/* Sidebar */}
            <Sidebar
                isExpanded={isSidebarExpanded}
                onToggleSidebar={toggleSidebar}
                userRole={userRole}
                onMenuClick={handleSidebarClick}
            />

            {/* Main Content */}
            <div style={{ flexGrow: 1 }}>
                <Navbar isSidebarExpanded={isSidebarExpanded} />
                <main
                    style={{
                        marginTop: "64px",
                        marginLeft: isSidebarExpanded ? "300px" : "70px",
                        padding: "20px",
                        transition: "margin-left 0.3s",
                    }}
                >
                    {renderComponent()}
                </main>
            </div>
        </div>
        </ ThemeProvider>

    );
};

export default AdminDashboard;