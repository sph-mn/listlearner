electron = require("electron")
fs = require("fs")
csv_parse = require("csv-parse/lib/sync")
csv_stringify = require("csv-stringify/lib/sync")
window = null
csv_delimiter = " "
current_path = null

var recent = {
  path: electron.app.getPath("userData") + "/recent.txt",
  paths: [],
  save: () => {
    fs.writeFileSync(recent.path, recent.paths.join("\n"))
  },
  load: () => {
    if (fs.existsSync(recent.path)) {
      recent.paths = fs.readFileSync(recent.path, "UTF-8").split("\n");
    }
  },
  add: (path) => {
    if (recent.paths.length > 6) recent.paths.unshift()
    recent.paths.push(path)
    recent.save()
  }
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

electron.ipcMain.on("get-app-info", (event, data) => {
  event.returnValue = {recent_paths: recent.paths, current_path}
})

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
    var path = paths[0]
    event.returnValue = read_file(path)
    window.setTitle(path)
    current_path = path
    recent.add(path)
  } else {
    event.returnValue = false
  }
})

electron.ipcMain.on("open-argument-path", function(event) {
  // different offset when packaged
  if (process.argv[0].endsWith("electron")) {
    var path = process.argv[2]
  } else {
    var path = process.argv[1]
  }
  if (path && fs.statSync(path).isFile()) {
    event.returnValue = read_file(path)
    window.setTitle(path)
    current_path = path
    recent.add(path)
  } else {
    event.returnValue = false
  }
})

electron.ipcMain.on("open-recent", function(event, recent_index) {
  var path = recent.paths[recent_index]
  if (path && fs.statSync(path).isFile()) {
    event.returnValue = read_file(path)
    window.setTitle(path)
    current_path = path
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

recent.load()
