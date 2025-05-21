const { app, BrowserWindow } = require('electron')
const path = require('path')

let splashWindow
let canvasTargetWindow // This will be your new window

app.whenReady().then(() => {
  // --- Create the Splash Window (source of the image) ---
  splashWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: false, // Recommended for security
      contextIsolation: true, // Recommended for security
      preload: path.join(__dirname, 'splash-preload.js'), // Create this file
      offscreen: true, // burada sihir başlıyor
    },
  })
  splashWindow.loadFile('splash.html')

  // --- Create the Canvas Target Window (destination for the image) ---
  canvasTargetWindow = new BrowserWindow({
    width: 1000, // Adjust size as needed
    height: 800,
    x: 900, // Optional: position it next to the splash window for testing
    webPreferences: {
      devTools: true,
      nodeIntegration: false, // Recommended for security
      contextIsolation: true, // Recommended for security
      preload: path.join(__dirname, 'canvas-target-preload.js'), // Create this file
    },
  })
  canvasTargetWindow.loadFile('canvas-target.html') // This is your new HTML file
  canvasTargetWindow.webContents.openDevTools({
    mode: 'detach',
  })

  // --- Listen for 'paint' on the splashWindow ---
  splashWindow.webContents.on('paint', (event, dirty, image) => {
    const buffer = image.getBitmap() // RGBA buffer
    const width = image.getSize().width
    const height = image.getSize().height

    // Send the buffer data to the canvasTargetWindow's renderer process
    // Note: Buffers are efficiently transferable over IPC
    canvasTargetWindow.webContents.send('update-canvas-frame', { buffer, width, height })

    // console.log('Frame painted and sent to canvas target window'); // Uncomment for debugging
  })

  // Optional: DevTools for debugging
  // splashWindow.webContents.openDevTools();
  // canvasTargetWindow.webContents.openDevTools();

  // Handle window closing (example)
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    // Recreate windows if app is activated and no windows are open
    // (You might want more sophisticated logic here)
  }
})
