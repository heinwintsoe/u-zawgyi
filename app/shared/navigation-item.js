const Observable = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const config = require("../shared/config");

exports.NavigationItem = function (title, module, parent, subItems) {

    const item = Observable.fromObject({
        title: title || "",
        module: module || "",
        parent: parent || null, // should be parent NavigationItem
        subItems: subItems || new ObservableArray([]) // Should be array of NavigationItem
    });

    return item;
};
