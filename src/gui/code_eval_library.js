window.onload = main;

if (!Array.prototype.removeAll) {
    Array.prototype.removeAll = function (predicate) {
        if (this == null) {
            throw new Error("Array.prototype.remove called on null or undefined");
        }
        if (typeof predicate !== 'function') {
            throw new Error("predicate must be a function");
        }
        var thisArg = arguments[1];
        var list = Object(this);
        var elemensToRemove = [];
        for (var i = 0; i < list.length; ++i) {
            if (predicate.call(thisArg, list[i], i, list)) {
                elemensToRemove.push(i);
            }
        }
        while (elemensToRemove.length) {
            list.splice(elemensToRemove.pop(), 1);
        }
    };
}

var Console = function () {
    'use strict';

    self.log = function () {
        var messages = [];
        for (var i = 0; i < arguments.length; ++i) {
            messages.push(arguments[i] + '');
        }
        var message = messages.join(' ');
        window.top.postMessage({
            token: document.getElementById('token').getAttribute('value'),
            type: "log",
            message: message
        }, '*');
    };

    return self;
};

function main(argument) {
    'use strict';

    function wrapGlobalFunc(func) {
        return function () {
            return func.apply(null, arguments);
        };
    }

    var old = {
        setTimeout: wrapGlobalFunc(window.setTimeout),
        setInterval: wrapGlobalFunc(window.setInterval),
        clearTimeout: wrapGlobalFunc(window.clearTimeout),
        clearInterval: wrapGlobalFunc(window.clearInterval)
    };

    function setFunc(array, name, remove) {
        window[name] = function (func, time) {
            var cancelId = old[name](function () {
                array.removeAll(function (elem) {
                    return remove && elem.func == func;
                });
                func();
            }, time);
            array.push({
                func: func,
                time: time,
                userCancelId: cancelId,
                cancelId: cancelId,
                paused: false
            });
            window.console.log(name, cancelId);
            return cancelId;
        };
    }

    function clearFunc(array, name) {
        window[name] = function (cancelId) {
            array.forEach(function (elem) {
                if (elem.userCancelId == cancelId) {
                    old[name](elem.cancelId);
                }
            });
            array.removeAll(function (elem) {
                return elem.userCancelId == cancelId;
            });
        };
    }

    function startFunc(array, name) {
        array.forEach(function (elem) {
            if (elem.paused) {
                elem.cancelId = old[name](elem.func, elem.time);
                elem.paused = false;
            }
        });
    }

    function stopFunc(array, name) {
        array.forEach(function (elem) {
            if (!elem.paused) {
                window.console.log(name, elem.cancelId);
                old[name](elem.cancelId);
                elem.paused = true;
            }
        });
    }

    var intervals = [];
    var timeouts = [];

    setFunc(timeouts, 'setTimeout', true);
    setFunc(intervals, 'setInterval', false);
    clearFunc(timeouts, 'clearTimeout');
    clearFunc(intervals, 'clearInterval');

    window.onmessage = function (e) {
        switch (e.data.type) {
            case "start":
                startFunc(intervals, 'setInterval');
                startFunc(timeouts, 'setTimeout');
                break;
            case "stop":
                stopFunc(intervals, 'clearInterval');
                stopFunc(timeouts, 'clearTimeout');
                break;
            default:
                window.console.warn("Got message without type");
        }
    };

    window.top.postMessage({
        token: document.getElementById('token').getAttribute('value'),
        type: "init"
    }, '*');

    if (userFunction === null) {
        throw new Error("No user defined function");
    }

    var console = Console();
    var canvas = document.querySelector('#canvas');
    if (!canvas) {
        throw new Error("Couldn't find canvas element");
    }
    var ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error("Cannot get canvas context");
    }

    window.onerror = function (error, url, line, col, errorObj) {
        console.log("line:", line - 6, "col:", col, "Error:", errorObj.message);
    };

    userFunction(console, ctx);
}
