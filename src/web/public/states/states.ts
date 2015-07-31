/// <reference path="../../../../typings/tsd.d.ts" />

module Main.States {
    class StateConfig {
        static $inject = ['$stateProvider', '$urlMatcherFactoryProvider'];
        constructor(
            $stateProvider: ng.ui.IStateProvider,
            $urlMatcherFactoryProvider: ng.ui.IUrlMatcherFactory) {

            $urlMatcherFactoryProvider.strictMode(false);
        }
    }

    angular.module('main.states').config(StateConfig);
}