electron = require("electron")
fs = require("fs")
csv_parse = require("csv-parse/lib/sync")
csv_stringify = require("csv-stringify/lib/sync")
window = null
csv_delimiter = " "
current_path = null

const storage = {
  cache: {
    recent: [],
    durations: {}
  },
  path: electron.app.getPath("userData") + "/storage.json",
  load: () => {
    if (fs.existsSync(storage.path)) {
      storage.cache = JSON.parse(fs.readFileSync(storage.path, "UTF-8"))
    }
  },
  save: () => {
    fs.writeFileSync(storage.path, JSON.stringify(storage.cache))
  },
  add_recent_path: (a) => {
    const cache = storage.cache
    cache.recent = cache.recent.filter(b => b != a)
    if (cache.recent.length > 6) cache.recent.unshift()
    cache.recent.push(a)
    storage.save()
  }
}

function read_file(path) {
  // string -> array
  return csv_parse(fs.readFileSync(path, "utf-8"), {
    delimiter: csv_delimiter,
    relax_column_count: true
  })
}

function save_file(path, data) {
  // array ->
  fs.writeFileSync(path, csv_stringify(data, {
    delimiter: csv_delimiter
  }))
}

electron.ipcMain.on("get-recent", (event, data) => {
  event.returnValue = {
    paths: storage.cache.recent,
    current_path
  }
})

electron.ipcMain.on("get-duration", (event, data) => {
  event.returnValue = storage.cache.durations[current_path] || 0
})

electron.ipcMain.on("set-duration", (event, duration) => {
  try {
    storage.cache.durations[current_path] = duration
    event.returnValue = false
  } catch (error) {
    event.returnValue = error.toString()
  }
})

electron.app.on("window-all-closed", () => electron.app.quit())
electron.ipcMain.on("quit", (event, path) => {
  storage.save()
  window.close()
})

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
    storage.add_recent_path(path)
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
    storage.add_recent_path(path)
  } else {
    event.returnValue = false
  }
})

electron.ipcMain.on("open-recent", function(event, recent_index) {
  var path = storage.cache.recent[recent_index]
  if (path && fs.statSync(path).isFile()) {
    event.returnValue = read_file(path)
    window.setTitle(path)
    current_path = path
    storage.add_recent_path(path)
  } else {
    event.returnValue = false
  }
})

electron.ipcMain.on("save", (event, data) => {
  try {
    save_file(current_path, data)
    storage.save()
    event.returnValue = false
  } catch (error) {
    event.returnValue = error.toString()
  }
})

process.on("uncaughtException", (error, origin) => {
  console.error(error)
  electron.dialog.showMessageBoxSync({
    type: "error",
    buttons: ["close"],
    message: origin + " " + error.toString()
  })
  electron.app.quit()
})

storage.load()
