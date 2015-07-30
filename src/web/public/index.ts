/// <reference path="../../../typings/tsd.d.ts" />

module Main {
    var app = angular.module('main', [
        'ui.bootstrap',
        'ui.router',
        'main.directives',
        'main.filters',
        'main.services',
        'main.states',
        'main.templates'
    ]);

    angular.module('main.directives', []);
    angular.module('main.filters', []);
    angular.module('main.services', []);
    angular.module('main.states', ['ui.router']);
    angular.module('main.templates', []);
}