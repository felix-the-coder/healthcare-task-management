import React from "react";

const TaskDashboard = () => {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <iframe
        src="http://127.0.0.1:5000/dashboard/"
        style={{ border: "none", width: "100%", height: "100vh" }}
        title="Task Dashboard"
        />
    </div>
  );
};

export default TaskDashboard;