electron = require "electron"
fs = require "fs"
window = null

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

current_path = null

electron.ipcMain.on "open-path", (event, path) ->
  current_path = path
  event.returnValue = fs.readFileSync path, "utf-8"

electron.ipcMain.on "save", (event, data) ->
  try
    fs.writeFileSync current_path, data
    event.returnValue = true
  catch
    event.returnValue = false

electron.ipcMain.on "quit", (event, path) -> window.close()
