var current_path, electron, fs, window;
electron = require("electron");
fs = require("fs");

window = null;

if (process.argv[0].endsWith("electron")) {
  current_path = process.argv[2];
} else {
  current_path = process.argv[1];
}

electron.app.whenReady().then(function() {
  window = new electron.BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    }
  });
  window.removeMenu();
  return window.loadFile("main.html");
});

electron.app.on("window-all-closed", function() {
  return electron.app.quit();
});

electron.ipcMain.on("open", function(event) {
  var paths;
  paths = electron.dialog.showOpenDialogSync({
    properties: ["openFile"]
  });
  if (paths) {
    current_path = paths[0];
    return event.returnValue = fs.readFileSync(current_path, "utf-8");
  } else {
    return event.returnValue = false;
  }
});

electron.ipcMain.on("open-path", function(event, path) {
  current_path = path;
  return event.returnValue = fs.readFileSync(path, "utf-8");
});

electron.ipcMain.on("save", function(event, data) {
  var exc;
  try {
    fs.writeFileSync(current_path, data);
    return event.returnValue = false;
  } catch (error) {
    exc = error;
    return event.returnValue = exc.toString();
  }
});

electron.ipcMain.on("quit", function(event, path) {
  return window.close();
});

electron.ipcMain.on("current_path", function(event) {
  if (current_path && fs.statSync(current_path).isFile()) {
    return event.returnValue = current_path;
  } else {
    return event.returnValue = false;
  }
});
