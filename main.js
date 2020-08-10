electron = require("electron")
fs = require("fs")
csv_parse = require("csv-parse/lib/sync")
csv_stringify = require("csv-stringify/lib/sync")
window = null
csv_delimiter = " "

// different arguments when packaged
if (process.argv[0].endsWith("electron")) {
  current_path = process.argv[2]
} else {
  current_path = process.argv[1]
}

function read_file(path) {
  // string -> array
  return csv_parse(fs.readFileSync(path, "utf-8"), {
    delimiter: csv_delimiter
  })
}

function save_file(path, data) {
  // array ->
  fs.writeFileSync(path, csv_stringify(data, {
    delimiter: csv_delimiter
  }))
}

electron.app.on("window-all-closed", () => electron.app.quit())
electron.ipcMain.on("quit", (event, path) => window.close())

electron.app.whenReady().then(function() {
  window = new electron.BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    }
  })
  window.removeMenu()
  //window.webContents.openDevTools()
  window.loadFile("main.html")
})

electron.ipcMain.on("open-dialog", event => {
  let paths = electron.dialog.showOpenDialogSync({
    properties: ["openFile"]
  })
  if (paths) {
    current_path = paths[0]
    window.setTitle(current_path)
    event.returnValue = read_file(current_path)
  } else {
    event.returnValue = false
  }
})

electron.ipcMain.on("open-current-path", function(event) {
  if (current_path && fs.statSync(current_path).isFile()) {
    event.returnValue = read_file(current_path)
    window.setTitle(current_path)
  } else {
    event.returnValue = false
  }
})

electron.ipcMain.on("save", (event, data) => {
  try {
    save_file(current_path, data)
    event.returnValue = false
  } catch (error) {
    event.returnValue = error.toString()
  }
})
