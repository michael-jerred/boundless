/// <reference path="../../../../../typings/tsd.d.ts" />

module Main.Views.Queue {

    interface ITrack {
        title: string;
        durationInSeconds: number;
        youtubeId: string;
    }

    class Controller {
        static $inject = [];
        constructor() {

        }

        public items: ITrack[] = [
            {
                title: 'Bonobo : Antenna',
                durationInSeconds: 213,
                youtubeId: 'oAt0YCj8x_Y'
            }
        ];
    }

    export var view = {
        templateUrl: 'views/queue/queue.html',
        controller: Controller,
        controllerAs: 'queueCtrl'
    };
}