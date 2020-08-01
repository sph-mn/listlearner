const electron = require("electron")
const content = document.getElementById("file-content")
const save_status = document.getElementById("save-status")
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
let row_data
let sort_i

function open(data) {
  if (!data) return
  content.innerHTML = ""
  row_data = data
  sort_i = data[0].length - 1
  data.forEach(function(line, index) {
    const a = document.createElement("div")
    const b = document.createElement("span")
    const c = document.createElement("span")
    b.classList.add("hidden")
    a.innerHTML = line[0]
    b.innerHTML = " " + line.slice(1, line.length - 1).join(" ") + " "
    c.innerHTML = line[line.length - 1]
    b.appendChild(c)
    a.appendChild(b)
    a.setAttribute("data-id", index)
    a.addEventListener("click", function() {
      for (let i = 0; i < content.children.length; i += 1) {
        if (a == content.children[i]) {
          set_selection(i)
          break
        }
      }
    })
    content.appendChild(a)
  })
  set_selection(0)
}

function save() {
  if (save_timeout) return
  save_status.classList.add("unsaved")
  save_timeout = setTimeout(function() {
    const error = electron.ipcRenderer.sendSync("save", row_data)
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

function find_lower(sort, start) {
  for (let i = start; i >= 0; i -= 1) {
    const id = content.children[i].getAttribute("data-id")
    if (row_data[id][sort_i] < sort) return content.children[i]
  }
  return false
}

function find_higher(sort, start) {
  for (let i = start; i < content.children.length; i += 1) {
    const id = content.children[i].getAttribute("data-id")
    if (row_data[id][sort_i] > sort + 1) return content.children[i]
  }
  return false
}

function move_up() {
  const a = content.children[selection]
  const id = a.getAttribute("data-id")
  const sort = row_data[id][sort_i] - 2
  row_data[id][sort_i] = sort
  a.children[0].children[0].innerHTML = sort
  if (0 < selection) {
    a.classList.remove("selected")
    const lower = find_lower(sort, selection - 1)
    if (lower) content.insertBefore(a, lower.nextSibling)
    else content.prepend(a)
    content.children[selection].classList.add("selected")
  }
  save()
}

function move_down() {
  const a = content.children[selection]
  const id = a.getAttribute("data-id")
  const sort = row_data[id][sort_i] + 1
  row_data[id][sort_i] = sort
  a.children[0].children[0].innerHTML = sort
  if (selection < content.children.length - 1) {
    a.classList.remove("selected")
    const higher = find_higher(sort, selection + 1)
    if (higher) content.insertBefore(a, higher)
    else content.append(a)
    content.children[selection].classList.add("selected")
  }
  save()
}

document.addEventListener("keydown", function(event) {
  if (key.down == event.keyCode) {
    select_next()
  } else if (key.up == event.keyCode) {
    select_previous()
  } else if (key.space == event.keyCode) {
    reveal()
  } else if (key.left == event.keyCode) {
    move_up()
  } else if (key.right == event.keyCode) {
    move_down()
  } else if (event.ctrlKey && key.q == event.keyCode) {
    electron.ipcRenderer.send("quit")
  } else {
    return
  }
  event.preventDefault()
})

document.getElementById("open").addEventListener("click", function() {
  open(electron.ipcRenderer.sendSync("open"))
})

const current_path = electron.ipcRenderer.sendSync("current_path")
if (current_path) open(electron.ipcRenderer.sendSync("open-path", current_path))
