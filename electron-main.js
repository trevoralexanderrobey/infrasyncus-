const { app, BrowserWindow, shell, dialog, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let backendProcess;

// Backend server configuration
const BACKEND_PORT = 3001;
const FRONTEND_PORT = 5173; // Vite default port

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 1000,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false // Disable for local file access in production
    },
    icon: path.join(__dirname, 'assets', 'icon.png'), // Add your app icon here
    title: 'InfraSyncus - Text Network Analysis & Zettelkasten',
    show: false, // Don't show until ready
    titleBarStyle: 'default'
  });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focus on the window
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Load the frontend
  if (isDev) {
    mainWindow.loadURL(`http://localhost:${FRONTEND_PORT}`);
  } else {
    // In production, serve the built frontend
    mainWindow.loadFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startBackend() {
  return new Promise((resolve, reject) => {
    console.log('Starting backend server...');
    
    const backendPath = path.join(__dirname, 'backend');
    const isWindows = process.platform === 'win32';
    
    // Start the backend server
    if (isDev) {
      backendProcess = spawn('npm', ['run', 'start:dev'], {
        cwd: backendPath,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: isWindows
      });
    } else {
      backendProcess = spawn('node', ['dist/main.js'], {
        cwd: backendPath,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: isWindows
      });
    }

    let output = '';
    
    backendProcess.stdout.on('data', (data) => {
      const message = data.toString();
      console.log('Backend:', message);
      output += message;
      
      // Check if server has started
      if (message.includes('Application is running on') || message.includes('Nest application successfully started')) {
        console.log('Backend server started successfully');
        resolve();
      }
    });

    backendProcess.stderr.on('data', (data) => {
      console.error('Backend Error:', data.toString());
    });

    backendProcess.on('close', (code) => {
      console.log(`Backend process exited with code ${code}`);
      if (code !== 0) {
        reject(new Error(`Backend failed to start with code ${code}`));
      }
    });

    backendProcess.on('error', (error) => {
      console.error('Failed to start backend:', error);
      reject(error);
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      if (!output.includes('Application is running on')) {
        reject(new Error('Backend server failed to start within 30 seconds'));
      }
    }, 30000);
  });
}

function startFrontend() {
  return new Promise((resolve, reject) => {
    if (!isDev) {
      // In production, frontend is served as static files
      resolve();
      return;
    }

    console.log('Starting frontend development server...');
    
    const frontendPath = path.join(__dirname, 'frontend');
    const isWindows = process.platform === 'win32';
    
    const frontendProcess = spawn('npm', ['run', 'dev'], {
      cwd: frontendPath,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: isWindows
    });

    let output = '';
    
    frontendProcess.stdout.on('data', (data) => {
      const message = data.toString();
      console.log('Frontend:', message);
      output += message;
      
      if (message.includes('Local:') || message.includes('localhost')) {
        console.log('Frontend server started successfully');
        resolve();
      }
    });

    frontendProcess.stderr.on('data', (data) => {
      console.error('Frontend Error:', data.toString());
    });

    frontendProcess.on('error', (error) => {
      console.error('Failed to start frontend:', error);
      reject(error);
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      if (!output.includes('Local:')) {
        reject(new Error('Frontend server failed to start within 30 seconds'));
      }
    }, 30000);
  });
}

function createApplicationMenu() {
  const template = [
    {
      label: 'InfraSyncus',
      submenu: [
        {
          label: 'About InfraSyncus v2.0.0',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About InfraSyncus',
              message: 'InfraSyncus v2.0.0 - JanusGraph Edition',
              detail: 'Advanced text-to-network visualization platform with JanusGraph knowledge graphs and Zettelkasten capabilities.\n\nFeatures:\n• Advanced Text Network Analysis\n• JanusGraph Graph Database\n• Knowledge Graph Visualization\n• Zettelkasten System\n• Real-time Analysis\n\nFor more information, visit the Help menu.'
            });
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'JanusGraph Setup Guide',
          click: () => {
            const setupPath = path.join(__dirname, 'JANUSGRAPH_SETUP.md');
            if (fs.existsSync(setupPath)) {
              shell.openPath(setupPath);
            } else {
              dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'JanusGraph Setup',
                message: 'JanusGraph Setup Guide',
                detail: 'To set up JanusGraph:\n\n1. Install Docker\n2. Run: docker-compose -f docker-compose.janusgraph.yml up -d\n3. Wait for JanusGraph to start\n4. Restart the application\n\nFor detailed instructions, see the documentation.'
              });
            }
          }
        },
        {
          label: 'Documentation',
          click: () => {
            shell.openExternal('https://github.com/your-repo/infrasyncus');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

async function initializeApp() {
  try {
    console.log('Initializing InfraSyncus v2.0.0 - JanusGraph Edition...');
    
    // Start backend first
    await startBackend();
    
    // Wait a moment for backend to be fully ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start frontend if in development
    if (isDev) {
      await startFrontend();
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Create the main window
    createWindow();
    
    // Create application menu
    createApplicationMenu();
    
    console.log('InfraSyncus v2.0.0 initialized successfully!');
    console.log('Features available:');
    console.log('• Text Network Analysis');
    console.log('• JanusGraph Graph Database (optional)');
    console.log('• Knowledge Graph Visualization');
    console.log('• Zettelkasten System');
    console.log('');
    console.log('To enable JanusGraph features:');
    console.log('1. Install Docker');
    console.log('2. Run: docker-compose -f docker-compose.janusgraph.yml up -d');
    console.log('3. Access Help > JanusGraph Setup Guide for detailed instructions');
    
  } catch (error) {
    console.error('Failed to initialize InfraSyncus:', error);
    
    dialog.showErrorBox(
      'Startup Error', 
      `Failed to start InfraSyncus v2.0.0: ${error.message}\n\nPlease check the console for more details.`
    );
    
    app.quit();
  }
}

// App event handlers
app.whenReady().then(initializeApp);

app.on('window-all-closed', () => {
  // Kill backend process
  if (backendProcess) {
    backendProcess.kill();
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  // Clean up backend process
  if (backendProcess) {
    backendProcess.kill();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
}); 