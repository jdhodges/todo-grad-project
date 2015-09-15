var testing = require("selenium-webdriver/testing");
var assert = require("chai").assert;
var helpers = require("./e2eHelpers");

testing.describe("end to end", function() {
    this.timeout(20000);
    testing.before(helpers.setupDriver);
    testing.beforeEach(helpers.setupServer);
    testing.afterEach(helpers.teardownServer);
    testing.after(function() {
        helpers.teardownDriver();
        helpers.reportCoverage();
    });

    testing.describe("on page load", function() {
        testing.it("displays TODO title", function() {
            helpers.navigateToSite();
            helpers.getTitleText().then(function(text) {
                assert.equal(text, "TODO List");
            });
        });
        testing.it("displays empty TODO list", function() {
            helpers.navigateToSite();
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 0);
            });
        });
        testing.it("displays an error if the request fails", function() {
            helpers.setupErrorRoute("get", "/api/todo");
            helpers.navigateToSite();
            helpers.getErrorText().then(function(text) {
                assert.equal(text, "Failed to get list. Server returned 500 - Internal Server Error");
            });
        });
    });
    testing.describe("on create todo item", function() {
        testing.it("clears the input field", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.getInputText().then(function(value) {
                assert.equal(value, "");
            });
        });
        testing.it("adds the todo item to the list", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 1);
            });
        });
        testing.it("displays an error if the request fails", function() {
            helpers.setupErrorRoute("post", "/api/todo");
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.getErrorText().then(function(text) {
                assert.equal(text, "Failed to create item. Server returned 500 - Internal Server Error");
            });
        });
        testing.it("can be done multiple times", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.addTodo("Another new todo item");
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 2);
            });
        });
    });
    testing.describe("on delete todo item", function() {
        testing.it("deletes the todo item from the list", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.deleteTodo();
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 0);
            });
        });
        testing.it("displays an error if the request fails", function() {
            helpers.setupErrorRoute("delete", "/api/todo/*");
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.deleteTodo();
            helpers.getErrorText().then(function(text) {
                assert.equal(text, "Failed to delete item. Server returned 404 - Not Found");
            });
        });
    });
    testing.describe("on complete todo item", function() {
        testing.it("marks the todo item as complete", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.completeTodo();
            helpers.navigateToSite();
            helpers.completeBoxChecked().then(function(bool) {
                assert(bool, true);
            });
        });
        testing.it("shows the correct number of tasks to complete", function() {
            helpers.navigateToSite();
            helpers.getTasksToCompleteText().then(function (text) {
                assert.equal(text, "0 tasks to complete");
            });
            helpers.addTodo("New todo item");
            helpers.getTasksToCompleteText().then(function (text) {
                assert.equal(text, "1 task to complete");
            });
            helpers.addTodo("New todo item");
            helpers.getTasksToCompleteText().then(function (text) {
                assert.equal(text, "2 tasks to complete");
            });
        });
        testing.it("displays an error if the request fails", function() {
            helpers.setupErrorRoute("complete", "/api/todo/*");
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.completeTodo();
            helpers.getErrorText().then(function(text) {
                assert.equal(text, "Failed to update item. Server returned 404 - Not Found");
            });
        });
    });
    testing.describe("on clear complete items", function() {
        testing.it("deletes completed items", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.addTodo("New todo item");
            helpers.addTodo("New todo item");
            helpers.completeAllTodos();
            helpers.clearCompleted();
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 0);
            });
        });

    });
    testing.describe("on filter items", function() {
        testing.it("shows all items when unfiltered", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.addTodo("New todo item");
            helpers.addTodo("New todo item");
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 3);
            });
        });
        testing.it("filters active items", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.addTodo("New todo item");
            helpers.addTodo("New todo item");
            helpers.completeTodo();
            helpers.filterActiveItems();
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 2);
            });
        });
        testing.it("filters completed items", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.addTodo("New todo item");
            helpers.addTodo("New todo item");
            helpers.completeTodo();
            helpers.filterCompletedItems();
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 1);
            });
        });
    });
});

