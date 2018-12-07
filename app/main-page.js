const Sqlite = require("nativescript-sqlite");

const MainViewModel = require("./main-view-model").MainViewModel;
const config = require("./shared/config");

exports.onNavigatingTo = (args) => {
    const page = args.object;
    (new Sqlite(config.databaseName)).then((db) => {

        const promises = [];
        promises.push(db.execSQL(config.schema.messagesTable));
        promises.push(db.execSQL(config.schema.labelsTable));
        promises.push(db.execSQL(config.schema.messagesAndLabels));

        Promise.all(promises).then((values) => {
            page.bindingContext = new MainViewModel(db);
            page.bindingContext.listView = page.getViewById("listView");
            page.bindingContext.navContext = page.navigationContext;
        }, (error) => {
            console.log("CREATE TABLE ERROR", error);
        });
    }, (error) => {
        console.log("OPEN DB ERROR", error);
    });
};

exports.androidBackEvent = (args) => {
    //To prevent navigating back
    // args.cancel = true;
    // Call  model's backed event handler 
    // model.onBackNav(args);
};
