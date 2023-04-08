"use strict";

window.addEventListener("load", () => {
  let TODOS = []
  if (localStorage.key("todos") && getItem("todos") != null && getItem("todos") instanceof Array) {
    TODOS = getItem("todos")
  }
  getById('sort').value = getSortOrder()
  getById("username").textContent = getUser()
//getById("experience").value = switchExperience()


  const newTodoForm = getById("new-todo-form")
  newTodoForm.addEventListener("submit", handleCreate)

  getById('sort').addEventListener("change", function(e) {
    sortBy(TODOS, this.value)
    displayTodos(TODOS)
  })
  getById('experience').addEventListener('change', switchExperience)

  getById('reset-todo-form').addEventListener('click', function() {
    newTodoForm.reset()
    let submitBtn = newTodoForm.submit
    submitBtn.textContent = "Create Todo";
    submitBtn.dataset.todo = null

    submitBtn.dataset.id = null
    submitBtn.dataset.done = false

    submitBtn.dataset.action = "create"
    this.setAttribute('disabled', 'disabled')
  })

  function displayTodos(todos) {
    getById("todo-list").innerHTML = ""
    if (!todos || todos.length < 1) {
      getById("todo-list").innerHTML = "<h1 id='placeholder' style='width:100%;padding:2em;text-align:center;color:#ddd;'>No Todos</h1>"
      return;
    }
    //getById("todo-list").innerHTML = ""
    let placeholder;
    if ((placeholder = getById("placeholder"))) {
      placeholder.remove()
      placeholder.style.backgroundColor = "transparent";
    }
    if (getSortOrder()) {
      sortBy(todos, getSortOrder())
    }
    if (todos.forEach) {
      return todos.forEach(todo => {
        getById("todo-list").appendChild(formatTodoList(todo))
      })
    }
    getById("todo-list").appendChild(formatTodoList(todos))
  }

  function formatTodoList(todo) {
    let todoItem = create("div");
    const todoList = create("div");
    todoItem.classList.add("todo-item");
    const label = create("label");
    const input = create("input");
    const span = create("span");
    const content = create("div");
    const actions = create("div");
    const edit = create("button");
    const deleteButton = create("button");
    input.type = "checkbox";
    input.name = "todo";
    input.checked = todo.done;
    span.classList.add("bubble");
    if (todo.category == "personal") {
      span.classList.add("personal");
    } else {
      span.classList.add("business");
    }
    content.classList.add("todo-content");
    actions.classList.add("actions");
    edit.classList.add("edit");
    deleteButton.classList.add("delete");
    todoItem.classList.add("todo-item")

    content.innerHTML = `<a href="/todos/${todo.id}">${todo.content}</a>`;
    edit.innerHTML = "Edit";
    deleteButton.innerHTML = "Delete";
    label.appendChild(input);
    label.appendChild(span);
    actions.appendChild(edit);
    actions.appendChild(deleteButton);
    todoItem.appendChild(label);
    todoItem.appendChild(content);
    todoItem.appendChild(actions);
    //link.appendChild(todoItem)
    todoList.appendChild(todoItem);
    if (todo.done) {
      todoItem.classList.add("done")

    }
    input.addEventListener("change", function() {
      if (this.checked) {
        todoItem.classList.add("done")
      } else {
        todoItem.classList.remove("done")
      }
      let i = TODOS.indexOf(todo)
      TODOS[i].done = !TODOS[i].done;
      displayTodos(TODOS)
      setItem("todos", TODOS)
    })
    deleteButton.addEventListener("click", () => handleDelete(todo))
    edit.addEventListener("click", (e) => handleUpdate(todo))
    return todoList
  }

  function setTodos(data) {
    setItem("todos", data);
  }

  function handleUpdate(todo) {
    let submitBtn = newTodoForm.submit
    submitBtn.textContent = "Update Todo";
    submitBtn.dataset.todo = JSON.stringify(todo)

    newTodoForm.content.value = todo.content
    newTodoForm.category.value = todo.category
    submitBtn.dataset.id = todo.id
    submitBtn.dataset.done = todo.done

    submitBtn.dataset.action = "update"
    getById('reset-todo-form').removeAttribute('disabled')
  }


  function handleDelete(todo) {
    if (!todo.done && !confirm("Are you sure you want to delete this todo? This action can not be reversed.")) {
      return;
    }
    TODOS = TODOS.filter(td => td.id !== todo.id)
    setItem("todos", TODOS)
    displayTodos(TODOS)
    toast("Deleted Todo!")
    e.target.reset()
  }

  function handleCreate(e) {
    e.preventDefault();
    let useTodo = e.target.elements.submit.dataset.todo || false;
    useTodo = useTodo && JSON.parse(useTodo)
    const target = e.target.elements;
    if (!target.content.value.trim()) {
      return toast("Please describe your content ")
    }
    let todo = {
      id: !useTodo ? uuid() : useTodo.id,
      content: target.content.value,
      category: target.category.value,
      done: !useTodo ? !true : useTodo.done,
      createdAt: Date.now()
    }
    if (useTodo) {
      TODOS = TODOS.map(td => td.id == useTodo.id ? todo : td)
      displayTodos(TODOS)
    } else {
      TODOS.push(todo)
      displayTodos(TODOS)
    }
    setItem("todos", TODOS)

    toast(`${useTodo?"Updated ":"Created new "} Todo!`)
    e.target.reset()
  }

  function getTodos() {
    return getItem('todos')
  }

  function getItem(key) {
    return JSON.parse(window.localStorage.getItem(key));
  }

  function setItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function clearAll() {
    document.querySelector("#todo-list").textContent = "";
    localStorage.removeItem("todos", JSON.stringify(todos));
  }

  function uuid() {
    // Public Domain/MIT
    var d = new Date().getTime(); //Timestamp
    var d2 =
      (typeof performance !== "undefined" &&
        performance.now &&
        performance.now() * 1000) ||
      0; //Time in microseconds since page-load or 0 if unsupported
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      var r = Math.random() * 16; //random number between 0 and 16
      if (d > 0) {
        //Use timestamp until depleted
        r = (d + r) % 16 | 0;
        d = Math.floor(d / 16);
      } else {
        //Use microseconds since page-load if supported
        r = (d2 + r) % 16 | 0;
        d2 = Math.floor(d2 / 16);
      }
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  function getById(id) {
    return document.getElementById(id);
  }

  function select(id) {
    return document.querySelector(`${id}`);
  }

  function getDataset(el, key) {
    return el.dataset[key]
  }

  function create(name) {
    return document.createElement(name)
  }

  function todoById(id) {
    let todos = getTodos();
    return todos.filter(todo => todo.id === id).at(0)
  }

  function getTodosExcept(id) {
    return todos.filter(todo => todo.id !== id)
  }


  function dd(...e) {
    console.log(e)
  }

  function toast(msg) {
    let toast = create("div")
    toast.setAttribute("class", "toast")
    let text = create("h2")
    text.textContent = msg
    toast.appendChild(text)
    select("body").appendChild(toast)
    let tm = setTimeout(() => {
      select("body").removeChild(toast)
      clearTimeout(tm)
    }, 1500)
  }

  function getSortOrder() {
    return getItem('sortOrder') || getById('sort').value
  }

  function getUser() {
    if (!(name = getItem('username'))) {
      let name = prompt("Hey! I would like to know your name 😇")
      alert(`${name.trim()} Welcome onboard, It's time to put your duties in order!`)
      setItem('username', name.trim())
      return name;
    }

    return name;

  }

  function sortBy(todos, order) {
    todos.sort((a, b) => {
      switch (order) {
        case 'asc':
          return b.createdAt - a.createdAt
          break;
        case 'desc':
          return a.createdAt - b.createdAt
          break;

        case 'completed':
          return b.done - a.done
          break;
        case 'active':
          return a.done - b.done
          break;
        default:
          return todos
          break;
      }
    })
    setItem("sortOrder", order)
  }
  String.prototype.ucfirst = function() {
    return this.charAt(0).toUpperCase() + this.slice(1, this.length)
  }

  function switchExperience() {
    let el = select("body")
    el.className = ''
    if(!this && !this.value){
      el.classList.add(getCurrentExperience())
      return;
    }
    switch (this.value) {
      case 'dark':
        el.classList.add("dark")
        break;
      case 'light':
        el.classList.add('light')
        break;
        case 'system':
             el.classList.add(getScheme())
             break;
    }
    setItem("experience", el.className)
  }

  function getCurrentExperience() {
    return getItem("experience") || getScheme()
  }

  function getScheme() {
    if (window.matchMedia) {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      } else {
        return 'light';
      }
    }
    return 'light';
  }
  //.//.
  displayTodos(TODOS)
})