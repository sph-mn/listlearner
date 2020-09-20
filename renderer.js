const electron = require("electron")

const list = {
  key: {
    left: 37,
    right: 39,
    up: 38,
    down: 40,
    q: 81,
    space: 32
  },
  selection: 0,
  content_data: null,
  move_distance: null,
  dom: {
    content: document.getElementById("file-content")
  },
  get_content: () => {
    result = []
    for (let i = 0; i < list.dom.content.children.length; i += 1) {
      const id = parseInt(list.dom.content.children[i].getAttribute("id"))
      result.push(list.content_data[id])
    }
    return result
  },
  set_content: (data) => {
    // [[string:csv_field, ...]]
    if (!data) return
    list.dom.content.innerHTML = ""
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
        for (let i = 0; i < list.dom.content.children.length; i += 1) {
          if (a == list.dom.content.children[i]) {
            list.set_selection(i)
            break
          }
        }
      })
      list.dom.content.appendChild(a)
    })
    list.content_data = data
    list.move_distance = Math.ceil(data.length / 2)
    list.set_selection(0)
  },
  set_selection: (index) => {
    list.dom.content.children[list.selection].classList.remove("selected")
    list.selection = index
    const a = list.dom.content.children[list.selection]
    a.classList.add("selected")
    const b = a.getBoundingClientRect()
    if (b.top < a.offsetHeight || b.bottom > window.innerHeight) {
      a.scrollIntoView({
        block: "center"
      })
    }
  },
  reveal: () => {
    list.dom.content.children[list.selection].children[0].classList.toggle("hidden")
  },
  select_previous: () => {
    list.set_selection(Math.max(0, list.selection - 1))
  },
  select_next: () => {
    list.set_selection(Math.min(list.dom.content.children.length - 1, list.selection + 1))
  },
  move_up: (far) => {
    if (0 == list.selection) return
    const a = list.dom.content.children[list.selection]
    a.classList.remove("selected")
    list.dom.content.insertBefore(a, list.dom.content.children[(far ? 0 : Math.max(0, list.selection - list.move_distance))])
    list.dom.content.children[list.selection].classList.add("selected")
    file.request_save()
  },
  move_down: (far) => {
    if ((list.dom.content.children.length - 1) <= list.selection) return
    const a = list.dom.content.children[list.selection]
    a.classList.remove("selected")
    const last_index = list.dom.content.children.length - 1
    b_index = (far ? last_index : list.selection + list.move_distance) + 1
    if (b_index >= last_index) list.dom.content.appendChild(a)
    else list.dom.content.insertBefore(a, list.dom.content.children[b_index])
    list.dom.content.children[list.selection].classList.add("selected")
    file.request_save()
  },
  quit: () => {
    duration.updateMain()
    file.save()
    electron.ipcRenderer.send("quit")
  },
  add_event_listeners: () => {
    document.addEventListener("keydown", function(event) {
      if (list.key.down == event.keyCode) {
        list.select_next()
      } else if (list.key.up == event.keyCode) {
        list.select_previous()
      } else if (list.key.space == event.keyCode) {
        list.reveal()
      } else if (list.key.left == event.keyCode) {
        list.move_up(!event.ctrlKey)
      } else if (list.key.right == event.keyCode) {
        list.move_down(!event.ctrlKey)
      } else if (event.ctrlKey && list.key.q == event.keyCode) {
        list.quit()
      } else {
        return
      }
      event.preventDefault()
    })
    document.getElementById("open").addEventListener("click", () => list.set_content(file.open_dialog()))
    recent.init()
    duration.init()
  },
  init: () => {
    file.init()
    list.add_event_listeners()
    list.set_content(file.open_argument_path())
  }
}

const file = {
  dom: document.getElementById("save-status"),
  interval_seconds: 20000,
  interval: null,
  needs_save: false,
  open: false,
  request_save: () => {
    file.needs_save = true
    file.dom.classList.add("unsaved")
  },
  trigger_before_open: () => {
    document.dispatchEvent(new Event("file-before-open"))
  },
  opened: () => {
    file.open = true
    document.dispatchEvent(new Event("file-after-open"))
  },
  save() {
    if (!file.needs_save) return false
    const error = electron.ipcRenderer.sendSync("save", list.get_content())
    if (error) return error
    file.needs_save = false
    file.dom.classList.remove("unsaved")
    return false
  },
  init: () => {
    file.interval = setInterval(file.save, file.interval_seconds)
  },
  open_recent: index => {
    file.trigger_before_open()
    const content = electron.ipcRenderer.sendSync("open-recent", index)
    if (content) file.opened()
    return content
  },
  open_dialog: () => {
    file.trigger_before_open()
    const content = electron.ipcRenderer.sendSync("open-dialog")
    if (content) file.opened()
    return content
  },
  open_argument_path: () => {
    file.trigger_before_open()
    const content = electron.ipcRenderer.sendSync("open-argument-path")
    if (content) file.opened()
    return content
  }
}

const recent = {
  dom: document.getElementById("recent"),
  update: () => {
    recent.dom.innerHTML = ""
    const recent_data = electron.ipcRenderer.sendSync("get-recent")
    recent_data.paths.forEach((a, index) => {
      if (recent_data.current_path == a) return
      const b = document.createElement("span")
      const basename = a.split("/")
      b.innerHTML = basename[basename.length - 1]
      b.setAttribute("class", "link-button")
      b.addEventListener("click", () => list.set_content(file.open_recent(index)))
      var separator = document.createTextNode(" | ")
      recent.dom.appendChild(separator)
      recent.dom.appendChild(b)
    })
  },
  init: () => {
    recent.update()
    document.addEventListener("file-after-open", recent.update)
  }
}

const duration = {
  interval_seconds: 10,
  dom: document.getElementById("duration"),
  interval: null,
  current: null,
  updateMain: () => {
    electron.ipcRenderer.sendSync("set-duration", duration.current)
  },
  update: () => {
    duration.dom.innerHTML = duration.current
  },
  start_timer() {
    if (duration.interval) return
    duration.interval = setInterval(() => {
      duration.current += duration.interval_seconds
      duration.update()
    }, duration.interval_seconds * 1000)
  },
  stop_timer() {
    clearInterval(duration.interval)
    duration.interval = null
  },
  init: () => {
    document.addEventListener("file-before-open", () => {
      if (file.open) duration.updateMain()
    })
    document.addEventListener("file-after-open", () => {
      duration.current = electron.ipcRenderer.sendSync("get-duration")
      duration.update()
      duration.start_timer()
    })
    window.addEventListener("focus", (event) => {
      duration.start_timer()
    })
    window.addEventListener("blur", (event) => {
      duration.stop_timer()
    })
  }
}

list.init()
