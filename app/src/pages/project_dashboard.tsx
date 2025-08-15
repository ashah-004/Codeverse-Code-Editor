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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Slide,
  Toolbar,
  Typography,
} from "@mui/material";
import CodeIcon from "@mui/icons-material/Code";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ProjectForm from "./project_form";
import axios from "axios";
import { TransitionProps } from "@mui/material/transitions";

export type Project = {
  _id: string;
  project_name: string;
  description: string;
  language: string;
  code: string;
};

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ProjectDashboard = () => {
  const navigate = useNavigate();
  const pythonImage = require("../assets/python.jpeg");
  const cppImage = require("../assets/cpp.jpeg");
  const jsImage = require("../assets/js.png");

  const CreateProject = require("../assets/website-maintenance.png");

  const [projects, setProjects] = useState<Project[]>([]);

  const [open, setOpen] = React.useState(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const [projectDeletionId, setProjectDeletionId] = useState<string | null>(
    null
  );

  const fetchProjects = async () => {
    try {
      const response = await axios.get("/projects");
      setProjects(response.data.projects);
    } catch (error) {
      console.error("Error fetching projects", error);
    }
  };

  const handleDelete = async () => {
    if (!projectDeletionId) return;

    try {
      await axios.delete(
        `/project/${projectDeletionId}/delete`
      );
      fetchProjects();
      setProjectDeletionId(null);
      setOpenDialog(false);
    } catch (error) {
      console.error("Error deleting project", error);
      alert("Failed to delete project.");
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
            {projects.length > 0 ? (
              projects.map((project, index) => (
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
                        <Box
                          display={"flex"}
                          alignItems={"center"}
                          justifyContent={"space-between"}
                          width={"100%"}
                        >
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
                          <IconButton
                            disableRipple
                            size="small"
                            onClick={() => (
                              setOpenDialog(true),
                              setProjectDeletionId(project._id)
                            )}
                          >
                            <DeleteOutlineIcon sx={{ color: "#ff0000" }} />
                          </IconButton>
                        </Box>
                      </CardActions>
                    </Card>
                  </Box>
                </Grid>
              ))
            ) : (
              <Box
                width="100%"
                height={"100%"}
                display={"flex"}
                justifyContent="center"
                alignItems={"center"}
                flexDirection={"column"}
              >
                <img src={CreateProject} width={"360px"} height={"360px"} />
                <Typography variant="h6" color="#0440de" fontFamily={"monospace"} ml={3}>No projects yet, Please create a new project.</Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Grid>
      <ProjectForm open={open} onOpen={() => setOpen(false)} />
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        TransitionComponent={Transition}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Do you want to delete your project?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Your project and the code you have written will be permanently
            deleted and you won't be able to recover it.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDialog(false)}
            sx={{ bgcolor: "#000", color: "#fff" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            sx={{ bgcolor: "#ff0000", color: "#fff" }}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProjectDashboard;
