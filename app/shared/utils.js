const Observable = require("data/observable").Observable;
const fecha = require('fecha');

exports.Utils = function () {

    const observable = new Observable();

    observable.formatDateAmOrPm = function (date) {

        return fecha.format(date, 'DD MMM YYYY, h:mm a');

    };

    return observable;
};
