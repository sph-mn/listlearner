const electron = require("electron")
const content = document.getElementById("file-content")
const save_status = document.getElementById("save-status")
const recent_paths = document.getElementById("recent-paths")
const key = {
  left: 37,
  right: 39,
  up: 38,
  down: 40,
  q: 81,
  space: 32
}
let selection = 0
let save_interval = 5000
let save_timeout = null
let content_data
let unsaved
let move_distance

function get_content() {
  result = []
  for (let i = 0; i < content.children.length; i += 1) {
    const id = parseInt(content.children[i].getAttribute("id"))
    result.push(content_data[id])
  }
  return result
}

function set_content(data) {
  // [[string:csv_field, ...]]
  if (!data) return
  content.innerHTML = ""
  data.forEach(function(line, index) {
    const b = document.createElement("span")
    b.classList.add("hidden")
    b.innerHTML = " " + line.slice(1).join(" ")
    const a = document.createElement("div")
    a.innerHTML = line[0]
    a.appendChild(b)
    a.setAttribute("id", index)
    a.addEventListener("click", function() {
      // find the current index
      for (let i = 0; i < content.children.length; i += 1) {
        if (a == content.children[i]) {
          set_selection(i)
          break
        }
      }
    })
    content.appendChild(a)
  })
  content_data = data
  move_distance = Math.ceil(data.length / 2)
  set_selection(0)
}

function save() {
  if (!unsaved) return false
  const error = electron.ipcRenderer.sendSync("save", get_content())
  if (error) return error
  unsaved = false
  return false
}

function save_with_timeout() {
  if (save_timeout) return
  save_status.classList.add("unsaved")
  save_timeout = setTimeout(function() {
    const error = save()
    clearTimeout(save_timeout)
    save_timeout = null
    if (error) {
      alert("save failed\n" + error)
    } else {
      save_status.classList.remove("unsaved")
    }
  }, save_interval)
}

function set_selection(index) {
  content.children[selection].classList.remove("selected")
  selection = index
  const a = content.children[selection]
  a.classList.add("selected")
  const b = a.getBoundingClientRect()
  if (b.top < a.offsetHeight || b.bottom > window.innerHeight) {
    a.scrollIntoView({
      block: "center"
    })
  }
}

function reveal() {
  content.children[selection].children[0].classList.toggle("hidden")
}

function select_previous() {
  set_selection(Math.max(0, selection - 1))
}

function select_next() {
  set_selection(Math.min(content.children.length - 1, selection + 1))
}

function move_up(far) {
  if (0 == selection) return
  unsaved = true
  const a = content.children[selection]
  a.classList.remove("selected")
  content.insertBefore(a, content.children[(far ? 0 : Math.max(0, selection - move_distance))])
  content.children[selection].classList.add("selected")
  save_with_timeout()
}

function move_down(far) {
  if ((content.children.length - 1) <= selection) return
  unsaved = true
  const a = content.children[selection]
  a.classList.remove("selected")
  const last_index = content.children.length - 1
  b_index = (far ? last_index : selection + move_distance) + 1
  if (b_index >= last_index) content.appendChild(a)
  else content.insertBefore(a, content.children[b_index])
  content.children[selection].classList.add("selected")
  save_with_timeout()
}

document.addEventListener("keydown", function(event) {
  if (key.down == event.keyCode) {
    select_next()
  } else if (key.up == event.keyCode) {
    select_previous()
  } else if (key.space == event.keyCode) {
    reveal()
  } else if (key.left == event.keyCode) {
    move_up(!event.ctrlKey)
  } else if (key.right == event.keyCode) {
    move_down(!event.ctrlKey)
  } else if (event.ctrlKey && key.q == event.keyCode) {
    electron.ipcRenderer.send("quit")
  } else {
    return
  }
  event.preventDefault()
})

function update_recent_paths() {
  recent_paths.innerHTML = ""
  const app_info = electron.ipcRenderer.sendSync("get-app-info")
  app_info.recent_paths.forEach((a, index) => {
    if (app_info.current_path == a) return
    const b = document.createElement("span")
    const basename = a.split("/")
    b.innerHTML = basename[basename.length - 1]
    b.setAttribute("class", "link-button")
    b.addEventListener("click", () => {
      set_content(electron.ipcRenderer.sendSync("open-recent", index))
      update_recent_paths()
    })
    var separator = document.createTextNode(" | ")
    recent_paths.appendChild(separator)
    recent_paths.appendChild(b)
  })
}

document.getElementById("open").addEventListener("click", () => {
  set_content(electron.ipcRenderer.sendSync("open-dialog"))
  update_recent_paths()
})

set_content(electron.ipcRenderer.sendSync("open-argument-path"))
update_recent_paths()
