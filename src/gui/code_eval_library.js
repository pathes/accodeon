window.onload = main;

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
            message: message
        }, '*');
    };

    return self;
};

function main(argument) {
    'use strict';
    if (userFunction == null) {
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
