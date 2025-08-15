import {
  Alert,
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  LinearProgress,
  linearProgressClasses,
  Snackbar,
  styled,
  Toolbar,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useEffect, useRef, useState } from "react";
import CodeIcon from "@mui/icons-material/Code";
import MonacoEditor from "react-monaco-editor";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Project } from "./project_dashboard";

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[600],
    ...theme.applyStyles("dark", {
      backgroundColor: theme.palette.grey[600],
    }),
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: "#0440de",
    ...theme.applyStyles("dark", {
      backgroundColor: "#0440de",
    }),
  },
}));

const Editor = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [output, setOutput] = useState<string>("");
  const [code, setCode] = useState<string>("");

  const [alertOpen, setAlertOpen] = useState<boolean>(false);

  const editorRef = useRef<any>(null);
  const navigate = useNavigate();

  const fetchProject = async (id: string) => {
    try {
      const response = await axios.get(`/project/${id}`);
      setProject(response.data);
      setCode(response.data.code);
    } catch (error) {
      console.error("Error fetching project", error);
    }
  };

  useEffect(() => {
    if (!project && projectId) {
      fetchProject(projectId);
    }
  }, [project, projectId]);

  const handleSave = async () => {
    if (!project) return;
    try {
      await axios.put(`/project/${projectId}/update`, {
        project_name: project.project_name,
        language: project.language,
        description: project.description,
        code: code,
      });
      setAlertOpen(true);
    } catch (error: any) {
      console.error("Error saving project", error.response || error.message);
      alert("Failed to save project.");
    }
  };

  const handleRun = async () => {
    setOutput("loading");
    if (!project) return;
    try {
      const response = await axios.post("/run", {
        language: project.language,
        code: code,
      });
      setOutput(response.data.output);

      await axios.put(`/project/${projectId}/update`, {
        project_name: project.project_name,
        language: project.language,
        description: project.description,
        code: code,
      });
    } catch (error: any) {
      console.error("Error running code", error.response || error.message);
      setOutput("Error running code");
    }
  };

  return (
    <>
      {/* AppBar Component */}
      <AppBar
        elevation={0}
        position="fixed"
        sx={{ bgcolor: "#100c08", zIndex: 2100 }}
      >
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
            <ArrowBackIcon sx={{ color: "#fff" }} fontSize="medium" />
          </div>
          <Button
            disableRipple
            variant="contained"
            sx={{ bgcolor: "#0440de", mr: 3 }}
            onClick={handleSave}
          >
            Save
          </Button>
          <IconButton
            disableRipple
            size="medium"
            sx={{ bgcolor: "#0440de", borderRadius: 2 }}
            onClick={() => handleRun()}
          >
            <PlayArrowOutlinedIcon sx={{ color: "#fff" }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer (Sidebar) */}
      {/* <Drawer
        sx={{
          width: "15%",
          flexShrink: 0,
          mt: 8, 
          "& .MuiDrawer-paper": {
            background: "#100c08",
            width: "15%",
            boxSizing: "border-box",
            padding: 1,
            mt: 8, 
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Grid container spacing={2} direction="column">
          <Grid size={12}>
            <Box display="flex" justifyContent="center" alignItems="center">
              <HomeOutlinedIcon fontSize="small" sx={{ color: "#fff" }} />
              <Typography
                variant="body2"
                component="div"
                color="#fff"
                sx={{ flexGrow: 1, marginLeft: 1 }}
              >
                Home
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Drawer> */}

      {/* Main Content */}
      <Box
        // marginLeft="15%"
        display="flex"
        flexDirection="column"
        width="100%"
        mt={8}
        height="calc(100vh - 64px)"
      >
        {/* Editor */}
        <Box flexBasis="60%" display="flex">
          <MonacoEditor
            ref={editorRef}
            height="100%"
            language="python"
            theme="vs-dark"
            options={{ selectOnLineNumbers: true }}
            value={code ?? "# please write your code here"}
            onChange={(newValue: string) => setCode(newValue)}
          />
        </Box>

        {/* Output */}
        <Box
          bgcolor="#100c08"
          height="40%"
          padding={1}
          sx={{
            overflowY: "auto",
          }}
        >
          <Grid container direction="column" spacing={2}>
            <Grid size={12}>
              <Typography variant="body1" component="div" color="#fff">
                Output
              </Typography>
            </Grid>
            <Grid size={12}>
              <Box
                component="pre"
                sx={{
                  backgroundColor: "#f5f5f5",
                  padding: 2,
                  borderRadius: 1,
                  marginTop: 1,
                  color: "#000",
                }}
              >
                {output === "loading" ? (
                  <BorderLinearProgress />
                ) : output ? (
                  output
                ) : (
                  "No output yet..."
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Snackbar open={alertOpen} autoHideDuration={6000} onClose={() => setAlertOpen(false)}>
        <Alert
          onClose={() => setAlertOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          The code was saved successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default Editor;
