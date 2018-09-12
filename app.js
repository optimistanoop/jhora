const {app, dialog, ipcMain, BrowserWindow} = require('electron');
app.showExitPrompt = true

let mainWindow;
let splash;
app.on('window-all-closed', ()=> {
  console.log('anp window-all-closed');
  app.quit();
});
app.on('will-quit', ()=> {
  console.log('anp will quit');
});
app.on('quit', ()=> {
  console.log('anp quit');
});

ipcMain.on('closed-db', (event, message)=>{
  console.log('anp db closed now', message);
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', ()=> {
  // Create the browser window.
  mainWindow = new BrowserWindow({show:false});

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  mainWindow.webContents.openDevTools()

  // create a new `splash`-Window backgroundColor:'#267ED5'
  splash = new BrowserWindow({show:false});
  //splash.webContents.openDevTools()
  splash.maximize();
  splash.show();
  splash.loadURL(`file://${__dirname}/loader.html`);


  // if main window is ready to show, then destroy the splash window and show up the main window
  mainWindow.once('ready-to-show', () => {
    setTimeout(function () {
      splash.destroy();
      mainWindow.maximize();
      mainWindow.show();
    }, 3000);

  });

  mainWindow.on('close', (e) => {
      console.log('anp close');
      if (app.showExitPrompt) {
          e.preventDefault() // Prevents the window from closing
          dialog.showMessageBox({
              type: 'question',
              buttons: ['Yes', 'No'],
              title: 'Confirm',
              message: 'Are you sure you want to quit?'
          }, function (response) {
              if (response === 0) { // Runs the following if 'Yes' is clicked
                  console.log('anp exit yes');
                  mainWindow.webContents.send('close-db', 'bye');
                  app.showExitPrompt = false
                  mainWindow.close()
              }
          })
      }
  })



  app.on('before-quit', (event)=> {
      console.log('anp before-quit');
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', ()=> {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    console.log('anp closed');
    mainWindow = null;
  });
});
