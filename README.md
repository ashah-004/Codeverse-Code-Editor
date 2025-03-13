# Codeverse Code Editor  

Codeverse Code Editor is a web-based code editor that allows users to write, save, and execute code in **Python, JavaScript, and C++**. It provides an intuitive interface for creating projects, writing code, and running it in an isolated environment. The execution process is securely handled using **Docker containers** to ensure controlled execution with memory and CPU limits.  

## 🚀 Features  

- 🌐 **Multi-Language Support**: Write and execute code in Python, JavaScript, and C++.  
- 🎨 **Intuitive UI**: Built with TypeScript and Material UI for a smooth user experience.  
- 🔄 **Project Management**: Create, save, retrieve, update, and delete projects with MongoDB.  
- 🚀 **Fast Execution**: Code execution is handled in **isolated Docker containers** to prevent interference.  
- 🛡 **Secure & Controlled**: Limits on memory and CPU usage ensure efficient resource management.  
- 🔥 **REST API**: FastAPI-based backend with structured endpoints for handling project data and execution.  
- 🔗 **CORS Enabled**: Ensures seamless interaction between the frontend and backend.  


## How to run

Assuming you have Docker, npm, Python 3, and Node installed on your system.

- **Clone the repo**

  ```sh
  git clone https://github.com/ashah-004/Online-Code-Editor.git
  ```

- **Go to the client folder and install dependencies**

  ```sh
  cd app
  npm install --legacy-peer-deps
  ```

- **Run the client application**

  ```sh
  cd app
  npm start
  ```

- **Go to the server folder and install dependencies**

  ```sh
  cd server
  pip install -r requirements.txt
  ```

- **Make sure that docker is up and running**

- **Run the server using Docker**

  ```sh
  cd server
  uvicorn server:app --host 0.0.0.0 --port 8000 --reload
  ```

The FastAPI server will start at [http://localhost:8000/](http://localhost:8000/).

Now, your **frontend** should be running on `http://localhost:3000` and the **backend** on `http://localhost:8000`. 🚀

## 🐳 Running the Docker Containers for Execution

Make sure Docker is running before executing any code. The backend will automatically manage execution inside isolated containers.

## 🚀 Future Improvements

- 📝 **More Language Support**: Expand beyond Python, JS, and C++.
- 🔄 **Real-time Collaboration**: Add live editing and collaboration features.
- 🌎 **Cloud Deployment**: Deploy the application for public access.
- 📂 **File Management System**: Enhance project storage with directory structures.
- 🛠 **Code Debugging & Autocomplete**: Improve editor functionalities.

---

🚀 **Code smart, build faster! Happy Coding!**
