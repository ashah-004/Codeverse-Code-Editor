import React, { useRef, useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import axios from 'axios';
import { Button } from '../components/button';
import { Card, CardContent } from '../components/card';

type LanguageOption = 'python' | 'cpp' | 'java' | 'javascript';

const FILE_EXTENSIONS: Record<LanguageOption, string> = {
  python: '.py',
  cpp: '.cpp',
  java: '.java',
  javascript: '.js',
};

const CodeEditor: React.FC = () => {
  const [files, setFiles] = useState<string[]>(['main.py']);
  const [selectedFile, setSelectedFile] = useState<string>('main.py');
  const [fileContents, setFileContents] = useState<{ [key: string]: string }>({
    'main.py': '# Write your Python code here...',
  });
  const [language, setLanguage] = useState<LanguageOption>('python');
  const [output, setOutput] = useState<string>('');

  const editorRef = useRef<any>(null);

  const handleRun = async () => {
    try {
      const response = await axios.post('http://localhost:8000/run', {
        language,
        code: fileContents[selectedFile] || '',
      });
      setOutput(response.data.output);
    } catch (error) {
      setOutput('Error running code');
    }
  };

  const addFile = () => {
    const newFileName = prompt('Enter file name:');
    if (newFileName && !files.includes(newFileName)) {
      const fileExtension = FILE_EXTENSIONS[language];
      const fileWithExtension = newFileName.endsWith(fileExtension)
        ? newFileName
        : newFileName + fileExtension;
      setFiles([...files, fileWithExtension]);
      setFileContents({ ...fileContents, [fileWithExtension]: '' });
    }
  };

  const deleteFile = (file: string) => {
    if (file === selectedFile) return alert('Cannot delete the active file!');
    if (window.confirm(`Delete ${file}?`)) {
      const updatedFiles = files.filter((f) => f !== file);
      const updatedContents = { ...fileContents };
      delete updatedContents[file];
      setFiles(updatedFiles);
      setFileContents(updatedContents);
      if (selectedFile === file) setSelectedFile(updatedFiles[0]);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Online Code Editor</h1>

      <div className="flex w-full max-w-6xl gap-4">
        {/* Sidebar */}
        <div className="w-1/4 bg-gray-800 p-4 rounded-lg shadow-lg">
          <h2 className="font-semibold text-lg mb-4">Files</h2>
          <ul className="space-y-2">
            {files.map((file) => (
              <li key={file} className="flex justify-between items-center bg-gray-700 p-2 rounded cursor-pointer hover:bg-gray-600">
                <span
                  className={`truncate ${selectedFile === file ? 'font-bold text-blue-400' : ''}`}
                  onClick={() => setSelectedFile(file)}
                >
                  {file}
                </span>
                <button className="text-red-400 hover:text-red-600" onClick={() => deleteFile(file)}>
                  🗑️
                </button>
              </li>
            ))}
          </ul>
          <Button onClick={addFile} className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded">
            ➕ Add File
          </Button>
        </div>

        {/* Editor Section */}
        <div className="w-3/4 flex flex-col gap-4">
          <div className="flex justify-between">
            <select
              className="p-2 border rounded bg-gray-800 text-white"
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageOption)}
            >
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="javascript">JavaScript</option>
            </select>
            <Button onClick={handleRun} className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded">
              ▶️ Run Code
            </Button>
          </div>
          
          <Card className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <CardContent>
              <MonacoEditor
                ref={editorRef}
                height="400px"
                language={language}
                theme="vs-dark"
                value={fileContents[selectedFile]}
                options={{ selectOnLineNumbers: true }}
                onChange={(newValue: string) =>
                  setFileContents({ ...fileContents, [selectedFile]: newValue || '' })
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Output Section */}
      <Card className="w-full max-w-6xl mt-6 bg-gray-800 p-4 rounded-lg shadow-lg">
        <CardContent>
          <h2 className="font-semibold text-lg">Output:</h2>
          <pre className="p-3 bg-black text-green-400 rounded-md mt-2 overflow-auto max-h-40">
            {output}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default CodeEditor;
