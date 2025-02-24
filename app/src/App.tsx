import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Editor from "./pages/editor";
import ProjectDashboard from "./pages/project_dashboard";
import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
    <Router>
        <Routes>
          <Route path="/" element={<ProjectDashboard />} />
          <Route path="/editor/:projectId" element={<Editor />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
