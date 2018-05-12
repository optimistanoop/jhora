const electron = require('electron');
const {ipcMain} = require('electron');
const app = electron.app;

let BrowserWindow = electron.BrowserWindow;

let mainWindow;
app.on('window-all-closed', ()=> {
    app.quit();
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', ()=> {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600});

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');
  mainWindow.webContents.openDevTools()
  
  app.on('before-quit', (event)=> {
      //event.preventDefault();
      mainWindow.webContents.send('close-db', 'bye')
  });
  
  // Emitted when the window is closed.
  mainWindow.on('closed', ()=> {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});


