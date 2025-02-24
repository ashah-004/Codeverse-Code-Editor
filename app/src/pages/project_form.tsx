import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

type formProps = {
  open: boolean;
  onOpen: () => void;
};

const ProjectForm = (props: formProps) => {
  const { open, onOpen } = props;

  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("python");
  const navigate = useNavigate();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    let initialCode = "";
    switch (language) {
      case "python":
        initialCode = "# Write your python code here\n";
        break;
      case "javascript":
        initialCode = "// Write your javascript code here\n";
        break;
      case "cpp":
        initialCode = "// Write your C++ code here\n";
        break;
      case "java":
        initialCode = "// Write your java code here\n";
        break;
      default:
        initialCode = "";
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/project/create",
        {
          project_name: projectName,
          language: language,
          description: description,
          code: initialCode,
        }
      );
      const projectId = response.data.project_id;

      navigate(`/editor/${projectId}`);
    } catch (error: any) {
      console.error("Error creating project", error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => onOpen()}
      maxWidth={"sm"}
      fullWidth={true}
    >
      <DialogTitle color="#0440de">Create Project</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Create a new project and start building the unimaginable!
        </DialogContentText>
        <Grid container direction={"column"} spacing={2} marginTop={3}>
          <Grid size={12}>
            <Grid container direction={"column"} spacing={1}>
              <Grid size={12}>
                <Typography variant="body2">Project Title</Typography>
              </Grid>
              <Grid size={12}>
                <TextField
                  size="small"
                  required
                  type="text"
                  fullWidth
                  variant="outlined"
                  placeholder="Title"
                  value={projectName}
                  onChange={(
                    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
                  ) => setProjectName(e.target.value)}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid size={12}>
            <Grid container direction={"column"} spacing={1}>
              <Grid size={12}>
                <Typography variant="body2">Project Description</Typography>
              </Grid>
              <Grid size={12}>
                <TextField
                  size="small"
                  required
                  type="text"
                  fullWidth
                  variant="outlined"
                  placeholder="Description"
                  multiline
                  rows={3}
                  value={description}
                  onChange={(
                    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
                  ) => setDescription(e.target.value)}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12}>
            <Grid container direction={"column"} spacing={1}>
              <Grid size={12}>
                <Typography variant="body2">Project Type</Typography>
              </Grid>
              <Grid size={12}>
                <Select
                  fullWidth
                  size="small"
                  value={language}
                  onChange={(event: SelectChangeEvent) =>
                    setLanguage(event.target.value)
                  }
                >
                  <MenuItem value={"python"}>Python</MenuItem>
                  <MenuItem value={"javascript"}>Javascript</MenuItem>
                  <MenuItem value={"cpp"}>C++</MenuItem>
                  <MenuItem value={"java"}>Java</MenuItem>
                </Select>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          fullWidth
          sx={{
            color: "#0440de",
            borderColor: "#0440de",
          }}
          disableRipple
          size="small"
          onClick={() => onOpen()}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          fullWidth
          sx={{
            bgcolor: "#0440de",
          }}
          disableRipple
          size="small"
          type="submit"
          onClick={handleSubmit}
        >
          Create Project
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectForm;
