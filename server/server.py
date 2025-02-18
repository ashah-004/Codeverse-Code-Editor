from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import shutil
import subprocess
import tempfile

app = FastAPI()

# CORS middleware to allow access from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Allow the frontend's origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Base directory where user projects will be stored
BASE_DIR = "user_projects"
os.makedirs(BASE_DIR, exist_ok=True)

# Supported Languages and Docker Images
DOCKER_IMAGES = {
    "python": "python:3.9",
    "cpp": "gcc:latest",
    "java": "openjdk:latest",
    "javascript": "node:latest",
    "react": "node:latest",  # React also uses Node.js for execution
}

# Define file extensions for each language
FILE_EXTENSIONS = {
    "python": ".py",
    "cpp": ".cpp",
    "java": ".java",
    "javascript": ".js",
    "react": ".js",  # React files usually use .js
}

# Execution limits
CPU_LIMIT = "0.5"
MEMORY_LIMIT = "128m"
TIMEOUT = 5

# Request Models
class CodeRequest(BaseModel):
    language: str
    code: str

class FileRequest(BaseModel):
    path: str
    content: str = ""

class FolderRequest(BaseModel):
    path: str

class DeleteRequest(BaseModel):
    path: str


# ==================== FILE & FOLDER MANAGEMENT ====================

@app.post("/file/create")
def create_file(request: FileRequest):
    """Create a new file with content."""
    file_path = os.path.join(BASE_DIR, request.path)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    with open(file_path, "w") as f:
        f.write(request.content)

    return {"message": "File created successfully", "path": request.path}

@app.get("/file/read")
def read_file(path: str):
    """Read a file's content."""
    file_path = os.path.join(BASE_DIR, path)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    with open(file_path, "r") as f:
        content = f.read()

    return {"path": path, "content": content}

@app.put("/file/update")
def update_file(request: FileRequest):
    """Update an existing file."""
    file_path = os.path.join(BASE_DIR, request.path)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    with open(file_path, "w") as f:
        f.write(request.content)

    return {"message": "File updated successfully", "path": request.path}

@app.delete("/file/delete")
def delete_file(request: DeleteRequest):
    """Delete a file."""
    file_path = os.path.join(BASE_DIR, request.path)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    os.remove(file_path)
    return {"message": "File deleted successfully", "path": request.path}

@app.post("/folder/create")
def create_folder(request: FolderRequest):
    """Create a new folder."""
    folder_path = os.path.join(BASE_DIR, request.path)
    os.makedirs(folder_path, exist_ok=True)

    return {"message": "Folder created successfully", "path": request.path}

@app.get("/folder/list")
def list_folder(path: str = ""):
    """List files and folders inside a directory."""
    folder_path = os.path.join(BASE_DIR, path)

    if not os.path.exists(folder_path):
        raise HTTPException(status_code=404, detail="Folder not found")

    items = os.listdir(folder_path)
    return {"path": path, "items": items}

@app.delete("/folder/delete")
def delete_folder(request: DeleteRequest):
    """Delete a folder and its contents."""
    folder_path = os.path.join(BASE_DIR, request.path)

    if not os.path.exists(folder_path):
        raise HTTPException(status_code=404, detail="Folder not found")

    shutil.rmtree(folder_path)
    return {"message": "Folder deleted successfully", "path": request.path}


# ==================== CODE EXECUTION IN DOCKER ====================

def run_code_in_docker(language: str, code: str):
    """Executes the given code inside an isolated Docker container."""
    
    if language not in DOCKER_IMAGES:
        raise HTTPException(status_code=400, detail="Unsupported language")

    file_extension = FILE_EXTENSIONS[language]

    # Create a temporary file for the user's code
    with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
        temp_file.write(code.encode())
        temp_file.flush()
        temp_filename = temp_file.name

    # Convert Windows path to Docker-compatible path
    if os.name == 'nt':  # Only needed for Windows
        temp_filename = temp_filename.replace("\\", "/")  # Fix backslashes for Docker
        temp_filename = f"/{temp_filename[0]}{temp_filename[2:]}"  # Convert C:\ to /c/

    try:
        # Construct the Docker command based on the language
        if language == "python":
            command = (
                f"docker run --rm --memory={MEMORY_LIMIT} --cpus={CPU_LIMIT} "
                f"-v {temp_filename}:{temp_filename} {DOCKER_IMAGES[language]} "
                f"python {temp_filename}"
            )

        elif language == "cpp":
            output_file = temp_filename.replace(".cpp", "")
            command = (
                f"docker run --rm --memory={MEMORY_LIMIT} --cpus={CPU_LIMIT} "
                f"-v {temp_filename}:{temp_filename} {DOCKER_IMAGES[language]} "
                f"sh -c 'g++ {temp_filename} -o {output_file} && {output_file}'"
            )

        elif language == "java":
            dir_path = os.path.dirname(temp_filename)
            base_name = os.path.basename(temp_filename).replace(".java", "")
            command = (
                f"docker run --rm --memory={MEMORY_LIMIT} --cpus={CPU_LIMIT} "
                f"-v {dir_path}:{dir_path} {DOCKER_IMAGES[language]} "
                f"sh -c 'javac {temp_filename} && java -cp {dir_path} {base_name}'"
            )

        elif language == "javascript":
            command = (
                f"docker run --rm --memory={MEMORY_LIMIT} --cpus={CPU_LIMIT} "
                f"-v {temp_filename}:{temp_filename} {DOCKER_IMAGES[language]} "
                f"node {temp_filename}"
            )

        # Run the Docker command with a timeout
        result = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=TIMEOUT)

        # Return output or errors
        return result.stdout if result.returncode == 0 else result.stderr

    except subprocess.TimeoutExpired:
        return "Error: Execution timed out"

    finally:
        # Ensure that temp file cleanup works on both Windows and Unix systems
        if os.path.exists(temp_filename):  # Check if the file exists before attempting to delete
            os.remove(temp_filename)  # Cleanup temp file
@app.post("/run")
def execute_code(request: CodeRequest):
    """API endpoint to execute code in an isolated Docker container."""
    output = run_code_in_docker(request.language, request.code)
    return {"output": output}


# uvicorn server:app --host 0.0.0.0 --port 8000 --reload
