import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ProjectForm = () => {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("python");
  const navigate = useNavigate();

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    navigate("/editor", { state: { projectName, description, language } });
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-xl font-bold mb-4">Create New Project</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-semibold">Project Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block font-semibold">Description</label>
            <textarea
              className="w-full p-2 border rounded"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block font-semibold">Select Language</label>
            <select
              className="w-full p-2 border rounded"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>
          <button className="w-full bg-blue-500 text-white p-2 rounded" type="submit">
            Start Project
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
