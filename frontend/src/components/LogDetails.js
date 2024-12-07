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
  TextField,
  Typography,
} from "@mui/material";
import { getLogs } from "../api/api";

const LogDetails = () => {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    user_id: "",
    start_date: "",
    end_date: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [pagination.page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await getLogs({
        ...filters,
        page: pagination.page,
        per_page: pagination.per_page,
      });
      setLogs(response.data.logs);
      setPagination((prev) => ({
        ...prev,
        total: response.data.total,
        pages: response.data.pages,
      }));
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1
    fetchLogs();
  };

  const resetFilters = () => {
    setFilters({
      user_id: "",
      start_date: "",
      end_date: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1
    fetchLogs();
  };

  const handlePageChange = (direction) => {
    if (
      (direction === "prev" && pagination.page > 1) ||
      (direction === "next" && pagination.page < pagination.pages)
    ) {
      setPagination((prev) => ({
        ...prev,
        page: direction === "prev" ? prev.page - 1 : prev.page + 1,
      }));
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Log Details
      </Typography>
      <div style={{ marginBottom: "20px" }}>
      <TextField
        label="User ID"
        name="user_id"
        value={filters.user_id}
        onChange={handleFilterChange}
        style={{ marginRight: "10px" }}
        InputProps={{
          style: { color: "black" }, // Set text color to black
        }}
        InputLabelProps={{
          style: { color: "black" }, // Optional: Set label color to black
        }}
      />

      <TextField
        label="Start Date"
        name="start_date"
        type="date"
        value={filters.start_date}
        onChange={handleFilterChange}
        InputLabelProps={{ shrink: true, style: { color: "black" } }} // Set label color
        InputProps={{
          style: { color: "black" }, // Set text color
        }}
        style={{ marginRight: "10px" }}
      />

    <TextField
      label="End Date"
      name="end_date"
      type="date"
      value={filters.end_date}
      onChange={handleFilterChange}
      InputLabelProps={{ shrink: true, style: { color: "black" } }} // Set label color
      InputProps={{
        style: { color: "black" }, // Set text color
      }}
      style={{ marginRight: "10px" }}
    />

        <Button
          variant="contained"
          color="primary"
          onClick={applyFilters}
          style={{ marginRight: "10px" }}
        >
          Apply Filters
        </Button>
        <Button variant="outlined" color="secondary" onClick={resetFilters}>
          Reset Filters
        </Button>
      </div>
      {loading ? (
        <Typography variant="h6">Loading logs...</Typography>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Log ID</TableCell>
                  <TableCell>User ID</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Timestamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.log_id}>
                    <TableCell>{log.log_id}</TableCell>
                    <TableCell>{log.user_id}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.timestamp}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <Button
              variant="contained"
              onClick={() => handlePageChange("prev")}
              disabled={pagination.page === 1}
              style={{ marginRight: "10px" }}
            >
              Previous
            </Button>
            <Typography
              variant="body1"
              display="inline"
              style={{ marginRight: "10px" }}
            >
              Page {pagination.page} of {pagination.pages}
            </Typography>
            <Button
              variant="contained"
              onClick={() => handlePageChange("next")}
              disabled={pagination.page === pagination.pages}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default LogDetails;
