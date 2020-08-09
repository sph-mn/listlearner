electron = require("electron")
fs = require("fs")
csv_parse = require("csv-parse/lib/sync")
csv_stringify = require("csv-stringify/lib/sync")
window = null
sort_i = 0

if (process.argv[0].endsWith("electron")) {
  current_path = process.argv[2]
} else {
  current_path = process.argv[1]
}

function read_file(path) {
  let data = csv_parse(fs.readFileSync(path, "utf-8"), {
    delimiter: " "
  })
  sort_i = data[0].length - 1
  if (isNaN(parseInt(data[0][sort_i]))) {
    sort_i += 1
    data = data.map(a => a.concat([0]))
  } else {
    data.forEach(a => a[sort_i] = parseInt(a[sort_i]))
  }
  return data
}

electron.app.whenReady().then(function() {
  window = new electron.BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    }
  })
  window.removeMenu()
  //window.webContents.openDevTools()
  return window.loadFile("main.html")
})

electron.app.on("window-all-closed", function() {
  return electron.app.quit()
})

electron.ipcMain.on("open", function(event) {
  var paths
  paths = electron.dialog.showOpenDialogSync({
    properties: ["openFile"]
  })
  if (paths) {
    current_path = paths[0]
    return event.returnValue = read_file(current_path)
  } else {
    return event.returnValue = false
  }
})

electron.ipcMain.on("open-path", function(event, path) {
  current_path = path
  return event.returnValue = read_file(path)
})


electron.ipcMain.on("save", function(event, data) {
  var exc
  try {
    data = data.sort((a, b) => a[sort_i] - b[sort_i])
    data = csv_stringify(data, {
      delimiter: " "
    })
    fs.writeFileSync(current_path, data)
    return event.returnValue = false
  } catch (exc) {
    return event.returnValue = exc.toString()
  }
})

electron.ipcMain.on("quit", function(event, path) {
  return window.close()
})

electron.ipcMain.on("current_path", function(event) {
  if (current_path && fs.statSync(current_path).isFile()) {
    return event.returnValue = current_path
  } else {
    return event.returnValue = false
  }
})
