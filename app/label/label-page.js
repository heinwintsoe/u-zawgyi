const Sqlite = require("nativescript-sqlite");

const config = require("../shared/config");

const LabelViewModel = require("./label-view-model").LabelViewModel;

exports.onNavigatingTo = function (args) {
    const page = args.object;
    (new Sqlite(config.databaseName)).then((db) => {
        page.bindingContext = new LabelViewModel(db);
        page.bindingContext.listView = page.getViewById("listView");
        page.bindingContext.navigationContext = page.navigationContext;
    }, (error) => {
        console.log("OPEN DB ERROR", error);
    });
};
