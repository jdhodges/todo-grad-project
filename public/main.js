var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
var countLabel = document.getElementById("count-label");
var clearCompletedBtn = document.getElementById("clear-completed");
var filtersDiv = document.getElementById("filters");
//var fetch = require('node-fetch');

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

function createTodo(title, callback) {
    fetch("/api/todo", {method: "POST", body: JSON.stringify({title: title}),
        headers: {"Content-Type": "application/json"}})
        .then(function(res) {
            if (res.status === 201) {
                callback();
            } else {
                error.textContent = "Failed to create item. Server returned " + res.status + " - " + res.statusText;
            }
        });
}

function getTodoList(callback) {
    fetch("/api/todo", {method: "GET"})
        .then(function(res) {
            if (res.status === 200) {
                res.text().then(function(text) {
                    callback(JSON.parse(text));
                });
            } else {
                error.textContent = "Failed to get list. Server returned " + res.status + " - " + res.statusText;
            }
        });
}

function reloadTodoList() {
    var notCompletedCount = 0;
    var completedCount = 0;

    var selectedFilter = document.getElementsByClassName("selectedFilter")[0].textContent;

    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }

    todoListPlaceholder.style.display = "block";
    getTodoList(function(todos) {
        todoListPlaceholder.style.display = "none";
        todos.forEach(function(todo) {
            if (todo.isComplete) {
                completedCount++;
                if (selectedFilter === "Active") {
                    return;
                }
            } else {
                notCompletedCount++;
                if (selectedFilter === "Completed") {
                    return;
                }
            }

            var listItem = document.createElement("li");

            var divItem = document.createElement("div");
            divItem.setAttribute("class", "divItem");

            var labelItem = document.createElement("label");
            labelItem.textContent = todo.title;
            labelItem.setAttribute("class", "todoLabel");

            var delBtn = document.createElement("img");
            delBtn.setAttribute("class", "delBtn");
            delBtn.setAttribute("src", "delete.png");
            delBtn.todoId = todo.id;
            delBtn.onclick = deleteToDo;

            var isCompleteCheck = document.createElement("input");

            if (todo.isComplete) {
                isCompleteCheck.setAttribute("class", "isCompleteChecked");
            } else {
                isCompleteCheck.setAttribute("class", "isCompleteCheck");
            }

            isCompleteCheck.setAttribute("type", "checkBox");
            isCompleteCheck.setAttribute("value", "Complete");
            isCompleteCheck.checked = todo.isComplete;

            isCompleteCheck.todoId = todo.id;
            isCompleteCheck.isComplete = todo.isComplete;
            isCompleteCheck.onchange = isCompleteToDo;

            divItem.appendChild(isCompleteCheck);
            divItem.appendChild(labelItem);
            divItem.appendChild(delBtn);

            listItem.appendChild(divItem);

            todoList.appendChild(listItem);
        });
        // Update notCompletedCount
        if (notCompletedCount === 1) {
            countLabel.textContent = notCompletedCount + " task to complete";
        } else {
            countLabel.textContent = notCompletedCount + " tasks to complete";
        }

        // Show clear completed button
        if (completedCount > 0) {
            clearCompletedBtn.style.display = "inline";
            clearCompletedBtn.onclick = clearCompleted;
        } else {
            clearCompletedBtn.style.display = "none";
        }
    });

}

function deleteToDo(event) {
    var source = event.target || event.srcElement;

    var idToDelete = source.todoId;

    deleteTodoWithID(idToDelete, reloadTodoList);
}

function deleteTodoWithID(id, callback) {
    fetch("/api/todo/" + id, {method: "DELETE"})
        .then(function(res) {
            if (res.status === 200) {
                if (callback) {
                    callback();
                }
            } else {
                error.textContent = "Failed to delete item. Server returned " + res.status + " - " + res.statusText;
            }
        });
}

function isCompleteToDo(event) {
    var source = event.target || event.srcElement;

    var idToComplete = source.todoId;
    var currIsComplete = source.isComplete;

    fetch("/api/todo/" + idToComplete, {method: "PUT", body: JSON.stringify({isComplete: !currIsComplete}),
        headers: {"Content-Type": "application/json"}})
        .then(function(res) {
            if (res.status === 200) {
                reloadTodoList();
            } else {
                error.textContent = "Failed to update item. Server returned " + res.status + " - " + res.statusText;
            }
        });
}

function clearCompleted() {
    getTodoList(function(todos) {
        todos.forEach(function (todo) {
            if (todo.isComplete) {
                deleteTodoWithID(todo.id);
            }
        });
        reloadTodoList();
    });
}

function filterClick() {
    var source = window.event.target;
    document.getElementsByClassName("selectedFilter")[0].setAttribute("class", "filter");
    source.setAttribute("class", "selectedFilter");
    reloadTodoList();
}

//var poll = setInterval(reloadTodoList, 10000);
reloadTodoList();

