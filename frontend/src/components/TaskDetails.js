import React, { useState, useEffect,useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import {
  fetchTasks,
  fetchHeapTasks,
  fetchHighestPriorityTask,
  syncHeapWithDB,
  addTask,
  updateTask,
  deleteTask,
} from "../api/api";

const TaskDetails = () => {
  const [tasks, setTasks] = useState([]); // All tasks from database
  const [heapTasks, setHeapTasks] = useState([]); // Tasks in the heap
  const [priorityTask, setPriorityTask] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTask, setNewTask] = useState({
    task_id: "",
    patient_id: "",
    description: "",
    urgency: "",
    time_sensitive: "",
    status: "Pending",
  });
  const status = ["Pending", "Completed"];

  // Function to reset the error message
  const resetError = useCallback(() => setErrorMessage(""), []);

  // Fetch all tasks from the database
  const loadAllTasks = useCallback(async () => {
    try {
      resetError();
      const response = await fetchTasks();
      setTasks(Array.isArray(response) ? response : []);
    } catch (error) {
      setErrorMessage("Error fetching tasks from database.");
    }
  }, [resetError]);

  // Fetch tasks from the heap
  const loadHeapTasks = useCallback(async () => {
    try {
      resetError();
      const response = await fetchHeapTasks();
      setHeapTasks(Array.isArray(response) ? response : []);
    } catch (error) {
      setErrorMessage("Error fetching tasks from heap.");
    }
  }, [resetError]);

  // Fetch the highest-priority task
  const loadPriorityTask = useCallback(async () => {
    try {
      resetError();
      const response = await fetchHighestPriorityTask();
      setPriorityTask(response || null);
    } catch (error) {
      setErrorMessage("Error fetching the highest-priority task.");
    }
  }, [resetError]);

  // Load tasks when the component mounts
  useEffect(() => {
    loadAllTasks();
    loadHeapTasks();
    loadPriorityTask();
  }, [loadAllTasks, loadHeapTasks, loadPriorityTask]);

  // Sync in-memory queue with the database
  const handleSync = async () => {
    try {
      resetError();
      await syncHeapWithDB();
      loadHeapTasks(); // Reload heap tasks after sync
    } catch (error) {
      setErrorMessage("Error syncing heap with database.");
    }
  };

  // Open dialog for adding or editing tasks
  const handleOpenDialog = (task = null) => {
    setSelectedTask(task);
    setNewTask(
      task || {
        task_id: "",
        patient_id: "",
        description: "",
        urgency: "",
        time_sensitive: "",
        status: "Pending",
      }
    );
    setIsDialogOpen(true);
  };

  // Close the dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedTask(null);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  // Save a new or edited task
  const handleSaveTask = async () => {
    try {
      resetError();
      if (selectedTask) {
        await updateTask(selectedTask.task_id, newTask);
      } else {
        await addTask(newTask);
      }
      loadAllTasks(); // Reload tasks from the database
      loadHeapTasks(); // Reload heap tasks
      loadPriorityTask(); // Reload priority task
      handleCloseDialog();
    } catch (error) {
      setErrorMessage("Error saving task. Please try again.");
    }
  };

  // Delete a task
  const handleDeleteTask = async (taskId) => {
    try {
      resetError();
      await deleteTask(taskId);
      loadAllTasks(); // Reload tasks from the database
      loadHeapTasks(); // Reload heap tasks
      loadPriorityTask(); // Reload priority task
    } catch (error) {
      setErrorMessage("Error deleting task. Please try again.");
    }
  };

  return (
    <Box padding={3}>
      <Typography variant="h4" gutterBottom>
        Task Management
      </Typography>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      <Box marginBottom={2}>
        <Button variant="contained" color="primary" onClick={handleSync}>
          Sync Heap with Database
        </Button>
        <Button
          variant="contained"
          color="secondary"
          style={{ marginLeft: "10px" }}
          onClick={() => handleOpenDialog()}
        >
          Add Task
        </Button>
        {priorityTask && (
          <Typography variant="h6" marginTop={2}>
            Highest Priority Task: {priorityTask.description} (ID:{" "}
            {priorityTask.task_id})
          </Typography>
        )}
      </Box>

      <Typography variant="h5" gutterBottom>
        All Tasks
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Task ID</TableCell>
              <TableCell>Patient ID</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Urgency</TableCell>
              <TableCell>Time Sensitive</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <TableRow key={task.task_id}>
                  <TableCell>{task.task_id}</TableCell>
                  <TableCell>{task.patient_id}</TableCell>
                  <TableCell>{task.description}</TableCell>
                  <TableCell>{task.urgency}</TableCell>
                  <TableCell>{task.time_sensitive}</TableCell>
                  <TableCell>{task.status}</TableCell>
                  <TableCell>
                    <Button color="primary" onClick={() => handleOpenDialog(task)}>
                      Edit
                    </Button>
                    <Button color="secondary" onClick={() => handleDeleteTask(task.task_id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No tasks found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h5" gutterBottom marginTop={4}>
        Heap Tasks
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Task ID</TableCell>
              <TableCell>Patient ID</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Urgency</TableCell>
              <TableCell>Time Sensitive</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {heapTasks.length > 0 ? (
              heapTasks.map((task) => (
                <TableRow key={task.task_id}>
                  <TableCell>{task.task_id}</TableCell>
                  <TableCell>{task.patient_id}</TableCell>
                  <TableCell>{task.description}</TableCell>
                  <TableCell>{task.urgency}</TableCell>
                  <TableCell>{task.time_sensitive}</TableCell>
                  <TableCell>{task.status}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No heap tasks found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{selectedTask ? "Edit Task" : "Add Task"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Task ID"
            name="task_id"
            value={newTask.task_id}
            onChange={handleInputChange}
            fullWidth
            margin="dense"
            style={{ display: !selectedTask ? "none" : "block" }}
            disabled={!!selectedTask}
          />
          <TextField
            label="Patient ID"
            name="patient_id"
            value={newTask.patient_id}
            onChange={handleInputChange}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Description"
            name="description"
            value={newTask.description}
            onChange={handleInputChange}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Urgency"
            name="urgency"
            type="number"
            value={newTask.urgency}
            onChange={handleInputChange}
            fullWidth
            margin="dense"
          />
          <InputLabel 
          margin="dense" 
          style={{ marginLeft: "10px", marginTop:"10px" }}
          fullWidth
          >Deadline</InputLabel>
          <TextField
            label=""
            name="time_sensitive"
            type="datetime-local"
            value={newTask.time_sensitive}
            onChange={handleInputChange}
            fullWidth
            margin="dense"
          />
          <FormControl 
          fullWidth 
          style={{ display: !selectedTask ? "none" : "block" }}
          margin="dense">
            <InputLabel>Status</InputLabel>
            <Select fullWidth  name="status" value={newTask.status} onChange={handleInputChange}>
              {status.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveTask} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskDetails;
