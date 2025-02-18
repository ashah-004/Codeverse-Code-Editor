import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import CodeEditor from './pages/code_editor';
import ProjectForm from './pages/project_form';
import ProjectDashboard from './pages/project_dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProjectDashboard />} />
        <Route path="/create-project" element={<ProjectForm />} />
        <Route path="/editor" element={<CodeEditor />} />
      </Routes>
    </Router>
  );
}

export default App;
