from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import subprocess
import tempfile
from pymongo import MongoClient
from bson import ObjectId

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def docker_path(path: str) -> str:
    if os.name == 'nt':
        drive, rest = os.path.splitdrive(path)
        if not drive or not rest:
            raise ValueError(f"Invalid path: {path}")
        
        drive = drive.replace(":", "").lower()
        rest = rest.replace("\\", "/")  
        converted_path = f"/mnt/{drive}{rest}" 

        print(f"Original Windows path: {path}")
        print(f"Converted Docker path: {converted_path}")

        return converted_path

# MongoDB setup
client = MongoClient("mongodb+srv://ashah004:VVJTOGPUC685SIDT@project-infra-mongodb.z53hj7n.mongodb.net/?retryWrites=true&w=majority&appName=project-infra-mongodb")
db = client["code_editor"]
projects_collection = db["projects"]

# Supported Languages and their Docker Images
DOCKER_IMAGES = {
    "python": "python:3.9",
    "cpp": "gcc:latest",
    "javascript": "node:latest",
}

# file extensions
FILE_EXTENSIONS = {
    "python": ".py",
    "cpp": ".cpp",
    "javascript": ".js",
}

# Execution limits
CPU_LIMIT = "0.5"
MEMORY_LIMIT = "128m"
TIMEOUT = 5

class CodeRequest(BaseModel):
    language: str
    code: str

class ProjectRequest(BaseModel):
    project_name: str
    language: str
    description: str = ""
    code: str = "" 

# ==================== MONGODB APIS ====================

@app.post("/project/create")
def create_project(request: ProjectRequest):
    project_data = {
        "project_name": request.project_name,
        "language": request.language,
        "description": request.description,
        "code": request.code,
    }
    try:
        result = projects_collection.insert_one(project_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error inserting project: {e}")
    return {"message": "Project created successfully", "project_id": str(result.inserted_id)}

@app.get("/project/{project_id}")
def get_project(project_id: str):
    project = projects_collection.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return {
        "project_id": str(project["_id"]),
        "project_name": project["project_name"],
        "language": project["language"],
        "description": project["description"],
        "code": project["code"],
    }

@app.put("/project/{project_id}/update")
def update_project(project_id: str, request: ProjectRequest):
    updated_data = {
        "project_name": request.project_name,
        "language": request.language,
        "description": request.description,
        "code": request.code,
    }
    result = projects_collection.update_one({"_id": ObjectId(project_id)}, {"$set": updated_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project updated successfully", "project_id": project_id}

@app.delete("/project/{project_id}/delete")
def delete_project(project_id: str):
    result = projects_collection.delete_one({"_id": ObjectId(project_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted successfully", "project_id": project_id}

@app.get("/projects")
def list_projects():
    try:
        projects = list(projects_collection.find())
        for project in projects:
            project["_id"] = str(project["_id"])
        return {"projects": projects}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching projects: {e}")

# ==================== DOCKER EXECUTION ====================

def run_code_in_docker(language: str, code: str):
    if language not in DOCKER_IMAGES:
        raise HTTPException(status_code=400, detail="Unsupported language")
    
    file_extension = FILE_EXTENSIONS[language]

    with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
        temp_file.write(code.encode())
        temp_file.flush()
        temp_filename = temp_file.name

    if os.name == 'nt':
        temp_filename = temp_filename.replace("\\", "/")
        temp_filename = f"/{temp_filename[0]}{temp_filename[2:]}"  

    try:
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
                f"-v {temp_filename}:{temp_filename} {DOCKER_IMAGES['cpp']} "
                f'sh -c "g++ {temp_filename} -o {output_file} && {output_file}"'
            )
        
        elif language == "javascript":
            command = (
                f"docker run --rm --memory={MEMORY_LIMIT} --cpus={CPU_LIMIT} "
                f"-v {temp_filename}:{temp_filename} {DOCKER_IMAGES[language]} "
                f"node {temp_filename}"
            )
        else:
            raise HTTPException(status_code=400, detail="Unsupported language")

        result = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=TIMEOUT)
        return result.stdout if result.returncode == 0 else result.stderr
    except subprocess.TimeoutExpired:
        return "Error: Execution timed out"
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

@app.post("/run")
def execute_code(request: CodeRequest):
    output = run_code_in_docker(request.language, request.code)
    return {"output": output}

# To run the server:
# uvicorn server:app --host 0.0.0.0 --port 8000 --reload
