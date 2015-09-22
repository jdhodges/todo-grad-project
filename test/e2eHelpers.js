var express = require("express");
var createServer = require("../server/server");
var webdriver = require("selenium-webdriver");
var istanbul = require("istanbul");
var path = require("path");
var fs = require("fs");

var testPort = 52684;
var baseUrl = "http://localhost:" + testPort;
var instrumenter = new istanbul.Instrumenter();
var collector = new istanbul.Collector();
var gatheringCoverage = process.env.running_under_istanbul;
var coverageFilename = "build_artifacts/coverage-e2e.json";

var driver;
var router;
var server;

module.exports.setupDriver = function() {
    driver = new webdriver.Builder().forBrowser("chrome").build();
};

module.exports.setupServer = function(done) {
    router = express.Router();
    if (gatheringCoverage) {
        router.get("/main.js", function(req, res) {
            var absPath = path.join(__dirname, "..", "public", "main.js");
            res.send(instrumenter.instrumentSync(fs.readFileSync("public/main.js", "utf8"), absPath));
        });
    }
    server = createServer(testPort, router, done);
};

module.exports.teardownServer = function(done) {
    server.close(done);
};

module.exports.teardownDriver = function() {
    if (gatheringCoverage) {
        driver.executeScript("return __coverage__;").then(function (coverage) {
            collector.add(coverage);
        });
    }
    driver.quit();
};

module.exports.reportCoverage = function() {
    if (gatheringCoverage) {
        fs.writeFileSync(coverageFilename, JSON.stringify(collector.getFinalCoverage()), "utf8");
    }
};

module.exports.navigateToSite = function() {
    driver.get(baseUrl);
};

module.exports.getTitleText = function() {
    return driver.findElement(webdriver.By.css("h1")).getText();
};

module.exports.getInputText = function() {
    return driver.findElement(webdriver.By.css("#todo-form md-input-container input")).getAttribute("ng-value");
};

module.exports.getErrorText = function() {
    var errorElement = driver.findElement(webdriver.By.id("error"));
    driver.wait(webdriver.until.elementTextContains(errorElement, "Failed"), 5000);
    return errorElement.getText();
};

module.exports.getTodoList = function() {
    var todoListLoading = driver.findElement(webdriver.By.id("todo-loading"));
    driver.wait(webdriver.until.elementIsNotVisible(todoListLoading), 5000);
    return driver.findElements(webdriver.By.css("#todo-list md-card"));
};

module.exports.getHiddenTodos = function() {
    var todoListLoading = driver.findElement(webdriver.By.id("todo-loading"));
    driver.wait(webdriver.until.elementIsNotVisible(todoListLoading), 5000);
    return driver.findElements(webdriver.By.css("#todo-list .ng-hide"));
};

module.exports.addTodo = function(text) {
    driver.findElement(webdriver.By.id("input_3")).sendKeys(text);
    driver.findElement(webdriver.By.id("input_3")).sendKeys(webdriver.Key.RETURN);
    var todoListLoading = driver.findElement(webdriver.By.id("todo-loading"));
    driver.wait(webdriver.until.elementIsNotVisible(todoListLoading), 5000);
};

// ADDED

module.exports.deleteTodo = function() {
    var todoListLoading = driver.findElement(webdriver.By.id("todo-loading"));
    driver.findElement(webdriver.By.tagName("md-card")).then(function(elem) {
        driver.actions().mouseMove(elem).perform().then(function() {
            driver.wait(webdriver.until.elementLocated(webdriver.By.className("material-icons")), 5000);
            driver.findElement(webdriver.By.className("material-icons")).click();
            driver.wait(webdriver.until.elementIsNotVisible(todoListLoading), 5000);
        });
    });
};

module.exports.completeTodo = function() {
    var todoListLoading = driver.findElement(webdriver.By.id("todo-loading"));
    driver.findElement(webdriver.By.tagName("md-checkbox")).click();
    driver.wait(webdriver.until.elementIsNotVisible(todoListLoading), 5000);
};

module.exports.completeAllTodos = function() {
    driver.findElements(webdriver.By.tagName("md-card")).then(function(checks_arr) {
        var todoListLoading = driver.findElement(webdriver.By.id("todo-loading"));
        for (var i = 0; i < checks_arr.length; i++) {
            driver.findElement(webdriver.By.css(".row .ng-pristine")).click();
            driver.wait(webdriver.until.elementIsNotVisible(todoListLoading), 5000);
        }
    });
};

module.exports.clearCompleted = function() {
    driver.wait(webdriver.until.elementLocated(webdriver.By.id("clear-completed")), 5000);
    driver.findElement(webdriver.By.id("clear-completed")).click();
};

module.exports.completeBoxChecked = function() {
    return Boolean(driver.findElement(webdriver.By.tagName("md-checkbox")).getAttribute("aria-checked"));
};

module.exports.getTasksToCompleteText = function() {
    return driver.findElement(webdriver.By.id("count-label")).getText();
};

module.exports.filterActiveItems = function() {
    var todoListLoading = driver.findElement(webdriver.By.id("todo-loading"));
    driver.findElements(webdriver.By.tagName("md-tab-item")).then(function(elements) {
        elements[1].click();
    });
    driver.wait(webdriver.until.elementIsNotVisible(todoListLoading), 5000);
};

module.exports.filterCompletedItems = function() {
    var todoListLoading = driver.findElement(webdriver.By.id("todo-loading"));
    driver.findElements(webdriver.By.tagName("md-tab-item")).then(function(elements) {
        elements[2].click();
    });
    driver.wait(webdriver.until.elementIsNotVisible(todoListLoading), 5000);
};

module.exports.setupErrorRoute = function(action, route) {
    if (action === "get") {
        router.get(route, function(req, res) {
            res.sendStatus(500);
        });
    }
    if (action === "post") {
        router.post(route, function(req, res) {
            res.sendStatus(500);
        });
    }
    if (action === "delete") {
        router.delete(route, function(req, res) {
            res.sendStatus(404);
        });
    }
    if (action === "complete") {
        router.put(route, function(req, res) {
            res.sendStatus(404);
        });
    }
};
