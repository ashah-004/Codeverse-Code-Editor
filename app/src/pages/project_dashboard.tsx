import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid2";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,

  Toolbar,
  Typography,
} from "@mui/material";
import CodeIcon from "@mui/icons-material/Code";
import ProjectForm from "./project_form";
import axios from "axios";

export type Project = {
  _id: string;
  project_name: string;
  description: string;
  language: string;
  code: string;
};

const ProjectDashboard = () => {
  const navigate = useNavigate();
  const pythonImage = require("../assets/python.jpeg");
  const cppImage = require("../assets/cpp.jpeg");
  const jsImage = require("../assets/js.png");

  const [projects, setProjects] = useState<Project[]>([]);

  const [open, setOpen] = React.useState(false);

  const fetchProjects = async () => {
    try {
      const response = await axios.get("http://localhost:8000/projects");
      setProjects(response.data.projects);
    } catch (error) {
      console.error("Error fetching projects", error);
    }
  };

  useEffect(() => {
    if (projects.length === 0) {
      fetchProjects();
    }
  });

  const openProject = (project: Project) => {
    navigate(`/editor/${project._id}`);
  };

  const handleImage = (language: string) => {
    switch (language) {
      case "python":
        return pythonImage;
      case "cpp":
        return cppImage;
      case "javascript":
        return jsImage;
      default:
        break;
    }
  };

  return (
    <>
      <Grid container spacing={3}>
        <Grid size={12}>
          <AppBar elevation={0} position="fixed" sx={{ bgcolor: "#100c08" }}>
            <Toolbar>
              <div
                onClick={() => navigate("/")}
                style={{
                  flexGrow: 1,
                  marginLeft: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  cursor: "pointer",
                }}
              >
                <CodeIcon fontSize="large" />
                <Typography variant="h6">CodeVerse</Typography>
              </div>
              <Button
                disableRipple
                variant="contained"
                sx={{ bgcolor: "#0440de" }}
                onClick={() => setOpen(true)}
              >
                Create Project
              </Button>
            </Toolbar>
          </AppBar>
        </Grid>
        <Grid size={12} marginTop={8}>
          <Grid container direction={"row"} spacing={3} marginBottom={3}>
            {projects.map((project, index) => (
              <Grid size={4} key={index}>
                <Box
                  display={"flex"}
                  justifyContent={"center"}
                  alignItems={"center"}
                >
                  <Card variant="elevation" sx={{ maxWidth: 275 }}>
                    <CardMedia
                      sx={{ height: 120 }}
                      image={handleImage(project.language)}
                      title="python"
                    />
                    <CardContent>
                      <Typography
                        color="#0440de"
                        gutterBottom
                        variant="h6"
                        component="div"
                      >
                        {project.project_name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        {project.description}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        sx={{
                          "&:hover": {
                            backgroundColor: "transparent",
                          },
                          color: "#0440de",
                        }}
                        disableRipple
                        size="small"
                        onClick={() => openProject(project)}
                      >
                        Open Project
                      </Button>
                    </CardActions>
                  </Card>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
      <ProjectForm open={open} onOpen={() => setOpen(false)} />
    </>
  );
};

export default ProjectDashboard;
