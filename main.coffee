electron = require "electron"
fs = require "fs"
window = null

if process.argv[0].endsWith("electron")
  current_path = process.argv[2]
else
  current_path = process.argv[1]

electron.app.whenReady().then () ->
  window = new electron.BrowserWindow({webPreferences: {nodeIntegration: true}})
  window.removeMenu()
  window.loadFile "main.html"
  #window.webContents.openDevTools()

electron.app.on "window-all-closed", () -> electron.app.quit()

electron.ipcMain.on "open", (event) ->
  paths = electron.dialog.showOpenDialogSync({properties: ["openFile"]})
  if paths
    current_path = paths[0]
    event.returnValue = fs.readFileSync current_path, "utf-8"
  else
    event.returnValue = false


electron.ipcMain.on "open-path", (event, path) ->
  current_path = path
  event.returnValue = fs.readFileSync path, "utf-8"

electron.ipcMain.on "save", (event, data) ->
  try
    fs.writeFileSync current_path, data
    event.returnValue = false
  catch exc
    event.returnValue = exc.toString()

electron.ipcMain.on "quit", (event, path) -> window.close()
electron.ipcMain.on "current_path", (event) ->
  if current_path and fs.statSync(current_path).isFile()
    event.returnValue = current_path
  else
    event.returnValue = false
