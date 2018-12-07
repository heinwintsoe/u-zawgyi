const Observable = require("data/observable");

exports.LabelObservable = function() {

    const observable = new Observable.Observable();
    observable.id = "";
    observable.label = "";
    observable.selected = false;
    observable.editing = false;
    observable.createdDateTime = new Date();

    return observable;
};

exports.fromObject = function(obj) {

    obj = obj || {};

    const observable = Observable.fromObject({
        id: obj.id || "",
        label: obj.label || "",
        selected: obj.selected || false,
        editing: obj.editing || false,
        createdDateTime: obj.createdDateTime || new Date()
    });

    return observable;

};

exports.fromParams = function(id, label, selected, editing, createdDateTime) {

    const observable = Observable.fromObject({
        id: id || "",
        label: label || "",
        selected: selected || false,
        editing: editing || false,
        createdDateTime: createdDateTime || new Date()
    });

    return observable;

};
