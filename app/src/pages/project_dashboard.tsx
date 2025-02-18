import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/button";
import { Card, CardContent } from "../components/card";

const ProjectDashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([
    { name: "python-project", description: "Python Project", language: "python" },
    {
      name: "javascript-project",
      description: "JavaScript Project",
      language: "javascript",
    },
  ]);

  const handleCreateProject = () => {
    navigate("/create-project");
  };

  const openProject = (project: {
    name: string;
    description?: string;
    language?: string;
  }) => {
    navigate(`/editor/${project.name}`, { state: project });
  };

  return (
    <div className="flex flex-col w-full p-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center pb-4 border-b">
        <h1 className="text-2xl font-bold">Your Projects</h1>
        <Button onClick={handleCreateProject}>+ Create Project</Button>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {projects.map((project, index) => (
          <div onClick={() => openProject(project)}>
            <Card key={index} className="cursor-pointer">
              <CardContent>
                <h2 className="text-lg font-semibold">{project.name}</h2>
                <p className="text-sm text-gray-500">{project.description}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectDashboard;
