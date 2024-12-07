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
  Tooltip,
  Select,
  FormControl,
  MenuItem,
  InputLabel,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import { addPatient, getPatient, updatePatient, deletePatient } from "../api/api";

const PatientDetails = () => {
  const [patients, setPatients] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: "",
    first_name: "",
    last_name: "",
    age: "",
    gender: "",
    condition: "",
  });

  const genderOptions = ["Male", "Female"];

  // Fetch patients when the component loads
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await getPatient();
      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const handleDialogOpen = (patient = null) => {
    setIsEdit(!!patient); // Set edit mode if a patient is passed
    if (patient) {
      setFormData({
        patient_id: patient.patient_id || "",
        first_name: patient.first_name || "",
        last_name: patient.last_name || "",
        age: patient.age || "",
        gender: patient.gender || "",
        condition: patient.condition || "",
      });
    } else {
      setFormData({
        patient_id: "",
        first_name: "",
        last_name: "",
        age: "",
        gender: "",
        condition: "",
      });
    }
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        age: parseInt(formData.age, 10),
      };

      if (isEdit) {
        // Update existing patient
        await updatePatient(data.patient_id, data);
      } else {
        // Add new patient
        await addPatient(data);
      }

      fetchPatients(); // Refresh the patient list
      handleDialogClose();
    } catch (error) {
      console.error("Error saving patient:", error);
    }
  };

  const handleDelete = async (patient_id) => {
    try {
      await deletePatient(patient_id);
      fetchPatients(); // Refresh the patient list
    } catch (error) {
      console.error("Error deleting patient:", error);
    }
  };

  return (
    <div>
      <h2>Patients Details</h2>
      <Button variant="contained" color="primary" onClick={() => handleDialogOpen()}>
        Add New Patient
      </Button>
      <TableContainer component={Paper} style={{ marginTop: "20px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient ID</TableCell>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Condition</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.patient_id}>
                <TableCell>{patient.patient_id}</TableCell>
                <TableCell>{patient.first_name}</TableCell>
                <TableCell>{patient.last_name}</TableCell>
                <TableCell>{patient.age}</TableCell>
                <TableCell>{patient.gender}</TableCell>
                <TableCell>{patient.condition}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton color="primary" onClick={() => handleDialogOpen(patient)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton color="secondary" onClick={() => handleDelete(patient.patient_id)}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog for Add/Edit Patient */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>{isEdit ? "Edit Patient" : "Add New Patient"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Patient ID"
            name="patient_id"
            value={formData.patient_id}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            style={{ display: !isEdit ? "none" : "block" }}
            disabled={isEdit} // Disable editing Patient ID in edit mode
          />
          <TextField
            label="First Name"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Age"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            type="number"
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Gender</InputLabel>
            <Select name="gender" value={formData.gender} onChange={handleInputChange}>
              {genderOptions.map((gender) => (
                <MenuItem key={gender} value={gender}>
                  {gender}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Condition"
            name="condition"
            value={formData.condition}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            multiline
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

export default PatientDetails;
