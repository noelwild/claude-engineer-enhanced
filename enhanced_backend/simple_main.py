```python
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import sys
import asyncio
import subprocess
import json
import uuid
from typing import Dict, List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add Claude Engineer to path
sys.path.append('/app/claude-engineer')

# Import Claude Engineer components
try:
    from ce3 import Assistant
    CLAUDE_AVAILABLE = True
except ImportError as e:
    print(f"Claude Engineer import failed: {e}")
    CLAUDE_AVAILABLE = False

app = FastAPI(title="Claude Engineer Enhanced", version="2.0.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
terminal_sessions: Dict[str, dict] = {}
claude_assistant = None

async def initialize_claude():
    """Initialize Claude Assistant"""
    global claude_assistant
    if not CLAUDE_AVAILABLE:
        raise HTTPException(status_code=500, detail="Claude Engineer not available")
        
    api_key = os.getenv('ANTHROPIC_API_KEY')
    if not api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not found")
    
    try:
        claude_assistant = Assistant()
        return True
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize Claude: {str(e)}")

class TerminalManager:
    def __init__(self):
        self.sessions = {}
        
    async def create_session(self, session_id: str):
        """Create a new terminal session"""
        try:
            # Create a new bash process
            process = await asyncio.create_subprocess_shell(
                'bash',
                stdin=asyncio.subprocess.PIPE,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.STDOUT,
                env={**os.environ, 'PATH': '/opt/miniforge3/bin:' + os.environ.get('PATH', '')}
            )
            
            self.sessions[session_id] = {
                'process': process,
                'websocket': None
            }
            return session_id
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to create terminal session: {str(e)}")
    
    async def execute_command(self, session_id: str, command: str):
        """Execute command in terminal session"""
        if session_id not in self.sessions:
            raise HTTPException(status_code=404, detail="Terminal session not found")
        
        try:
            # Simple command execution for testing
            process = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                env={**os.environ, 'PATH': '/opt/miniforge3/bin:' + os.environ.get('PATH', '')}
            )
            
            stdout, stderr = await process.communicate()
            output = stdout.decode() if stdout else ""
            if stderr:
                output += stderr.decode()
            
            return output
        except Exception as e:
            return f"Error executing command: {str(e)}"

terminal_manager = TerminalManager()

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy", 
        "service": "claude-engineer-enhanced",
        "claude_available": CLAUDE_AVAILABLE,
        "api_key_configured": bool(os.getenv('ANTHROPIC_API_KEY'))
    }

@app.post("/api/terminal/create")
async def create_terminal_session():
    """Create new terminal session"""
    session_id = str(uuid.uuid4())
    await terminal_manager.create_session(session_id)
    return {"session_id": session_id}

@app.post("/api/terminal/{session_id}/execute")
async def execute_terminal_command(session_id: str, command_data: dict):
    """Execute command in terminal session"""
    command = command_data.get("command", "")
    output = await terminal_manager.execute_command(session_id, command)
    return {"output": output}

@app.post("/api/android/create-project")
async def create_android_project(project_data: dict):
    """Create new Android project with Kivy"""
    project_name = project_data.get("name", "MyApp")
    project_path = f"/app/android_projects/{project_name}"
    
    try:
        os.makedirs(project_path, exist_ok=True)
        
        # Enhanced Kivy app template
        main_py_content = f'''
"""
{project_name} - Enhanced Kivy Android Application
Created with Claude Engineer Enhanced
"""

from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.label import Label
from kivy.uix.button import Button
from kivy.uix.textinput import TextInput

class MainWidget(BoxLayout):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.orientation = 'vertical'
        self.padding = 20
        self.spacing = 10
        
        # Title
        title = Label(
            text='{project_name}',
            size_hint_y=None,
            height=100,
            font_size=24
        )
        self.add_widget(title)
        
        # Input field
        self.text_input = TextInput(
            hint_text='Enter some text...',
            size_hint_y=None,
            height=40
        )
        self.add_widget(self.text_input)
        
        # Button
        button = Button(
            text='Say Hello!',
            size_hint_y=None,
            height=50
        )
        button.bind(on_press=self.on_button_press)
        self.add_widget(button)
        
        # Output label
        self.output_label = Label(
            text='Welcome to {project_name}!',
            text_size=(None, None)
        )
        self.add_widget(self.output_label)
    
    def on_button_press(self, instance):
        text = self.text_input.text
        if text:
            self.output_label.text = f'Hello, {{text}}!'
        else:
            self.output_label.text = 'Please enter some text first!'

class {project_name}App(App):
    def build(self):
        return MainWidget()

if __name__ == '__main__':
    {project_name}App().run()
'''
        
        # Enhanced buildozer.spec
        buildozer_spec = f'''[app]
title = {project_name}
package.name = {project_name.lower().replace(' ', '')}
package.domain = org.claudeengineer

source.dir = .
source.include_exts = py,png,jpg,kv,atlas,txt,json

version = 1.0
requirements = python3,kivy==2.3.1,kivymd

[buildozer]
log_level = 2

[android]
accept_sdk_license = True
sdk_path = /opt/android-sdk
api = 34
minapi = 21
ndk = 25b
private_storage = True
orientation = portrait
fullscreen = 0

[android.permissions]
INTERNET = 1
WRITE_EXTERNAL_STORAGE = 1

[android.gradle_dependencies]
# Add gradle dependencies here

[android.gradle_repositories]
# Add gradle repositories here

[android.add_src]
# Add additional source directories here
'''
        
        # Write files
        with open(f"{project_path}/main.py", "w") as f:
            f.write(main_py_content)
            
        with open(f"{project_path}/buildozer.spec", "w") as f:
            f.write(buildozer_spec)
        
        # Create additional files
        with open(f"{project_path}/README.md", "w") as f:
            f.write(f"# {project_name}\n\nAndroid app created with Claude Engineer Enhanced\n\n## Build\n\n```bash\nbuildozer android debug\n```")
        
        return {"status": "success", "project_path": project_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create project: {str(e)}")

@app.post("/api/android/build")
async def build_android_app(build_data: dict):
    """Build Android APK using buildozer"""
    project_path = build_data.get("project_path")
    
    if not project_path or not os.path.exists(project_path):
        raise HTTPException(status_code=400, detail="Invalid project path")
    
    try:
        # Enhanced environment for building
        env = {
            **os.environ,
            'ANDROID_HOME': '/opt/android-sdk',
            'PATH': '/opt/miniforge3/bin:' + os.environ.get('PATH', ''),
            'GRADLE_OPTS': '-Xmx2048m',
            'ALLOWED_TO_BE_ROOT': '1',  # Allow buildozer to run as root
            'CI': '1',  # Non-interactive mode
            'DEBIAN_FRONTEND': 'noninteractive'  # Prevent interactive prompts
        }
        
        # Build with enhanced logging
        process = await asyncio.create_subprocess_shell(
            f"cd '{project_path}' && /opt/miniforge3/bin/buildozer android debug",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=env
        )
        
        stdout, stderr = await process.communicate()
        
        build_status = "completed" if process.returncode == 0 else "failed"
        
        # Find APK file if build succeeded
        apk_path = None
        if build_status == "completed":
            bin_dir = os.path.join(project_path, "bin")
            if os.path.exists(bin_dir):
                for file in os.listdir(bin_dir):
                    if file.endswith(".apk"):
                        apk_path = os.path.join(bin_dir, file)
                        break
        
        return {
            "status": build_status,
            "stdout": stdout.decode() if stdout else "",
            "stderr": stderr.decode() if stderr else "",
            "apk_path": apk_path
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Build failed: {str(e)}")

@app.get("/api/projects")
async def list_projects():
    """List all projects"""
    projects = []
    
    # List Android projects
    android_dir = "/app/android_projects"
    if os.path.exists(android_dir):
        for project in os.listdir(android_dir):
            if os.path.isdir(os.path.join(android_dir, project)):
                projects.append({
                    "name": project,
                    "type": "android",
                    "path": os.path.join(android_dir, project)
                })
    
    # List web projects
    web_dir = "/app/web_projects"
    if os.path.exists(web_dir):
        for project in os.listdir(web_dir):
            if os.path.isdir(os.path.join(web_dir, project)):
                projects.append({
                    "name": project,
                    "type": "web",
                    "path": os.path.join(web_dir, project)
                })
    
    return {"projects": projects}

# Claude endpoints with real functionality
@app.post("/api/claude/init")
async def initialize_claude_endpoint():
    """Initialize Claude Assistant"""
    try:
        success = await initialize_claude()
        return {"status": "success", "message": "Claude Assistant initialized and ready!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/claude/chat")
def chat_with_claude(message: dict):
    """Send message to Claude with full capabilities"""
    global claude_assistant
    
    if not claude_assistant:
        try:
            # Use sync version since claude_assistant.chat is sync
            import asyncio
            try:
                loop = asyncio.get_event_loop()
                loop.run_until_complete(initialize_claude())
            except:
                # Create new loop if none exists
                asyncio.run(initialize_claude())
        except Exception as e:
            return {"response": f"Claude initialization failed: {str(e)}. Please check your API key."}
    
    try:
        user_message = message.get("message", "")
        
        # Add development context
        enhanced_message = f"""
I'm working in a comprehensive development environment with:
- Full Python + miniconda setup
- Android SDK for mobile app development  
- Terminal access with all development tools
- Project management capabilities
- Working directory: /app

User request: {user_message}

Please provide practical, actionable assistance. You can suggest terminal commands, code examples, or complete project implementations.
"""
        
        response = claude_assistant.chat(enhanced_message)
        return {"response": response}
        
    except Exception as e:
        return {"response": f"I apologize, but I encountered an error: {str(e)}. Please try again."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
```
