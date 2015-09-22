var app = angular.module("app", ["ngMaterial"]);

app.controller("TodoListController", ["$http", function($http) {

    var error = document.getElementById("error");
    var loading = document.getElementById("todo-loading");

    var self = this;
    self.todos = {};
    self.newTodo = {};
    self.currentHover = -1;
    self.selectedFilter = -1;
    self.activeTasks = -1;
    self.completedTasks = -1;

    this.setClear = function(id) {
        console.log("Set Clear");
        self.currentHover = id;
    };

    this.clearCheck = function(id) {
        console.log("Clear check");
        return self.currentHover === id;
    };

    this.refreshTodoList = function() {
        console.log("Refresh");
        loading.style.display = "block";

        $http.get("/api/todo").success(function (data) {
            self.todos = data;

            if (self.activeTasks === -1 && self.completedTasks === -1) {
                self.activeCount();
            }
        }).error(function(status, statusText) {
            error.textContent = "Failed to get list. Server returned " + statusText + " - " + status;
        }).finally(function() {
            loading.style.display = "none";
        });
    };

    this.addTodo = function(todo) {
        console.log("Add");
        $http.post("api/todo", todo).success(function(data) {
            self.activeTasks++;
            self.refreshTodoList();
            self.newTodo = {};
        }).error(function(status, statusText) {
            error.textContent = "Failed to create item. Server returned " + statusText + " - " + status;
        });
    };

    this.completeTodo = function(todo) {
        console.log("Complete");
        loading.style.display = "block";

        $http.put("api/todo/" + todo.id, {isComplete: !todo.isComplete}).success(function(data) {
            if (todo.isComplete) {
                self.activeTasks--;
                self.completedTasks++;
            } else {
                self.activeTasks++;
                self.completedTasks--;
            }
        }).error(function(status, statusText) {
            error.textContent = "Failed to update item. Server returned " + statusText + " - " + status;
        }).finally(function() {
            loading.style.display = "none";
        });
    };

    this.deleteTodo = function(todo) {
        console.log("Delete");
        loading.style.display = "block";

        $http.delete("api/todo/" + todo.id).success(function(data) {
            if (todo.isComplete) {
                self.completedTasks--;
            } else {
                self.activeTasks--;
            }

            self.todos = self.todos.filter(function(otherTodo) {
                return otherTodo !== todo;
            });
        }).error(function(status, statusText) {
            error.textContent = "Failed to delete item. Server returned " + statusText + " - " + status;
        }).finally(function() {
            loading.style.display = "none";
        });
    };

    this.clearCompleted = function() {
        console.log("Clear completed");
        loading.style.display = "block";

        [].forEach.call(self.todos, function(todo) {
            if (todo.isComplete) {
                $http.delete("api/todo/" + todo.id).success(function(data) {
                    self.completedTasks--;
                    self.todos = self.todos.filter(function(otherTodo) {
                        return otherTodo !== todo;
                    });
                }).error(function(status, statusText) {
                    error.textContent = "Failed to delete item. Server returned " + statusText + " - " + status;
                }).finally(function() {
                    loading.style.display = "none";
                });
            }
        });
    };

    this.activeCount = function() {
        console.log("Active count");
        self.activeTasks = 0;
        self.completedTasks = 0;

        [].forEach.call(self.todos, function(todo) {
            if (todo.isComplete) {
                self.completedTasks++;
            } else {
                self.activeTasks++;
            }
        });
    };

    this.refreshTodoList();

}]);

