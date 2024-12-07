import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import { addUser, deleteUser, getUser, updateUser } from "../api/api";

const StaffManagement = () => {
  const [staffData, setStaffData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    empid:"",
    email: "",
    role: "",
    password: "",
  });

  const roles = ["Administrator", "Doctor", "Nurse"]; // Example roles

  // Fetch staff data
  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    try {
      const response = await getUser();
      setStaffData(response.data);
    } catch (error) {
      console.error("Error fetching staff data:", error);
    }
  };

  const handleDialogOpen = (staff = null) => {
    setIsEdit(!!staff);
    if (staff) {
      setFormData({
        empid: staff.id,
        email: staff.email,
        role: staff.role,
        password: "",
      });
    } else {
      setFormData({
        empid:"",
        email: "",
        role: "",
        password: "",
      });
    }
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (isEdit) {
        await updateUser(formData.email, { role: formData.role, password: formData.password });
      } else {
        await addUser(formData);
      }
      fetchStaffData();
      handleDialogClose();
    } catch (error) {
      console.error("Error saving staff data:", error);
    }
  };

  const handleDelete = async (email) => {
    try {
      await deleteUser(email);
      fetchStaffData();
    } catch (error) {
      console.error("Error deleting staff member:", error);
    }
  };

  return (
    <div>
      <h2>Staff Management</h2>
      <Button variant="contained" color="primary" onClick={() => handleDialogOpen()}>
        Add New Staff
      </Button>
      <TableContainer component={Paper} style={{ marginTop: "20px" }}>
        <Table>
          <TableHead>
            <TableRow>
            <TableCell>Employee ID</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {staffData.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell>{staff.id}</TableCell>
                <TableCell>{staff.email}</TableCell>
                <TableCell>{staff.role}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleDialogOpen(staff)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="secondary" onClick={() => handleDelete(staff.email)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog for Add/Edit Staff */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>{isEdit ? "Edit Staff" : "Add New Staff"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Employee ID"
            name="empid"
            value={formData.empid}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            style={{ display: !isEdit ? "none" : "block" }}
            disabled={isEdit} // Disable editing email for existing staff
          />
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            disabled={isEdit} // Disable editing email for existing staff
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select name="role" value={formData.role} onChange={handleInputChange}>
              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required={!isEdit} // Password required only for new staff
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            {isEdit ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default StaffManagement;
