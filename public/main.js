var todoList = document.getElementById("todo-list");
//var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
var app = angular.module("app", ["ngMaterial"]);

app.controller("TodoListController", ["$http", function($http) {

    var todoListCtrl = this;
    todoListCtrl.todos = {};
    todoListCtrl.newTodo = {};
    todoListCtrl.currentHover = -1;
    todoListCtrl.selectedFilter = -1;
    todoListCtrl.activeTasks = 0;
    todoListCtrl.completedTasks = 0;

    this.setClear = function(id) {
        todoListCtrl.currentHover = id;
    };

    this.clearCheck = function(id) {
        return todoListCtrl.currentHover === id;
    };

    this.refreshTodoList = function() {
        $http.get("/api/todo").success(function (data) {
            todoListCtrl.todos = data;

        });
    };

    this.addTodo = function(todo) {
        $http.post("api/todo", todo).success(function(data) {
            todoListCtrl.refreshTodoList();
            todoListCtrl.newTodo = {};
        });
    };

    this.completeTodo = function(todo) {
        $http.put("api/todo/" + todo.id, {isComplete: !todo.isComplete}).success(function(data) {
            //todoListCtrl.refreshTodoList();
        });
    };

    this.deleteTodo = function(todo) {
        $http.delete("api/todo/" + todo.id).success(function(data) {
            todoListCtrl.todos = todoListCtrl.todos.filter(function(otherTodo) {
                return otherTodo !== todo;
            });
        });
    };

    this.clearCompleted = function() {
        [].forEach.call(todoListCtrl.todos, function(todo) {
            if (todo.isComplete) {
                $http.delete("api/todo/" + todo.id).success(function(data) {
                    todoListCtrl.todos = todoListCtrl.todos.filter(function(otherTodo) {
                        return otherTodo !== todo;
                    });
                });
            }
        });
    };

    this.activeCount = function() {
        todoListCtrl.activeTasks = 0;
        todoListCtrl.completedTasks = 0;

        [].forEach.call(todoListCtrl.todos, function(todo) {
            if (todo.isComplete)
                todoListCtrl.completedTasks++;
            else
                todoListCtrl.activeTasks++;
        });

        if (todoListCtrl.activeTasks === 1) {
            return todoListCtrl.activeTasks + " task to complete";
        }

        return todoListCtrl.activeTasks + " tasks to complete";
    };

    this.applyFilter = function(todo) {
        return (todoListCtrl.selectedFilter===1 && todo.isComplete) || (todoListCtrl.selectedFilter===2 && !todo.isComplete);
    };

    this.refreshTodoList();

}]);

