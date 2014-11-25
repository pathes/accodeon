window.onload = main;

var Console = function (consoleSelector) {
    'use strict';

    var self = {
        $elem: document.querySelector(consoleSelector)
    };

    if (!self.$elem) {
        throw new Error("Requested element '" + consoleSelector + "' doesn't exists");
    }

    self.log = function () {
        var outputString = [];
        for (var i = 0; i < arguments.length; ++i) {
            outputString.push(arguments[i].toString());
        }
        outputString = outputString.join(' ') + '\n';
        self.$elem.appendChild(document.createTextNode(outputString));
    };

    return self;
};

function main(argument) {
    'use strict';
    if (userFunction === undefined) {
        throw new Error("No user defined fnction");
    }

    var console = Console('#console');

    userFunction(console);
}
