const Observable = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;

const LabelObservable = require("./label-observable");

exports.LabelViewModel = function (database) {

    const viewModel = new Observable.Observable();
    viewModel.labelText = "";
    viewModel.labels = new ObservableArray([]);
    viewModel.navigationContext = null;
    viewModel.listView = null;

    viewModel.onLoaded = function (args) {
        const count = viewModel.listView.items.length;
        if (count === 0) {
            loadLabels(viewModel, database);
        }
    };

    viewModel.onTapCreateLabel = function (args) {
        if (viewModel.labelText !== "") {
            const label = LabelObservable.fromParams(undefined, viewModel.labelText, false, false, new Date());
            createNewLabel(label, database).then((result) => {
                viewModel.labels.push(result);
                // Clear label box
                viewModel.set("labelText", "");
            }, (err) => {
                console.dir(err);
            });
        }
    };

    viewModel.onTapLblItem = function (args) {
        const layout = args.view;
        const bindingCtx = layout.bindingContext;
        const messages = viewModel.navigationContext.messages;
        if (messages.length > 0) {
            bindingCtx.selected = !bindingCtx.selected;
            if (bindingCtx.selected) {
                if (messages) {
                    messages.forEach((msg) => {
                        labelMsg(msg, bindingCtx, database);
                    });
                }
            }
            else if (!bindingCtx.selected) {
                if (messages) {
                    messages.forEach((msg) => {
                        unlabelMsg(msg, bindingCtx, database);
                    });
                }
            }
        }
        else if (!(messages.length > 0)) {
            const navigationEntry = {
                moduleName: "main-page",
                context: { source: "labels", body: bindingCtx },
                animated: true
                // Page navigation, without saving navigation history.
                // backstackVisible: false
            };
            const page = args.object.page;
            page.frame.navigate(navigationEntry);
        }
    };

    viewModel.onBackNav = function (args) {
        const button = args.object;
        const page = button.page;
        page.frame.goBack();
        // const page = args.object.page;
        // page.frame.navigate({ moduleName: "main-page" });
    };

    viewModel.onEditLabel = function (args) {
        const bindingCtx = args.object.bindingContext;
        bindingCtx.set("editing", true);
    };

    viewModel.onEditDone = function (args) {
        const bindingCtx = args.object.bindingContext;
        updateLabel(bindingCtx, database).then((result) => {
            bindingCtx.set("editing", false);
        }, (err) => {
            console.dir(err);
        });
    };

    viewModel.onDeleteLabel = function (args) {
        confirm("Are you sure to delete?").then((result) => {
            if (result) {
                const bindingCtx = args.object.bindingContext;
                deleteLabel(bindingCtx, database).then((result) => {
                    viewModel.set("labels", viewModel.labels.filter((lbl) => lbl.id !== bindingCtx.id));
                }, (err) => {
                    console.dir(err);
                });
            }
        });
    };

    return viewModel;
};

function loadLabels(viewModel, db) {
    selectAll(viewModel, db).then(function (labels) {
        if (labels) {
            viewModel.set("labels", labels);
        }
    }, function(error) {
        console.dir(error);
    });
}

function labelMsg(msg, label, db) {
    return new Promise(function (success, error) {
        db.execSQL("INSERT INTO message_labels (message, label) VALUES (?, ?)",
            [msg.id, label.id])
            .then((id) => {
                label.set("id", id);

                success(id);
            }, (err) => {
                error(err);
        });
    });
}

function unlabelMsg(msg, label, db) {
    return new Promise(function (success, error) {
        db.execSQL("DELETE FROM message_labels WHERE message=? AND label=?",
            [msg.id, label.id])
            .then((id) => {
                label.set("id", id);

                success(id);
            }, (err) => {
                error(err);
        });
    });
}

function createNewLabel(label, db) {
    return new Promise(function (success, error) {
        db.execSQL("INSERT INTO labels (label, createdDateTime) VALUES (?, ?)",
            [label.label, label.createdDateTime])
            .then((id) => {
                label.set("id", id);

                success(label);
            }, (err) => {
                error(err);
        });
    });
}

function selectAll(viewModel, db) {
    return new Promise(function(success, error) {
        db.all("SELECT * FROM labels")
            .then((rows) => {
                const labels = new ObservableArray([]);
                rows.forEach((row) => {
                    const label = LabelObservable.fromParams(row[0], row[1], false, false, row[2]);
                    setLabelSelectedStatus(label, viewModel);
                    labels.push(label);
                });
                success(labels);
            }, (err) => {
                error(err);
            });
    });
}

function setLabelSelectedStatus(label, viewModel) {
    viewModel.navigationContext.messages.forEach((msg) => {
        msg.labels.forEach((lbl) => {
            if (lbl.id === label.id) {
                label.set("selected", true);
            }
        });
    });
}

function updateLabel(label, db) {
    return new Promise(function(success, error) {
        db.all("UPDATE labels SET label=? WHERE id=?", [label.label, label.id])
            .then((result) => {
                success(label);
            }, (err) => {
                error(err);
            });
    });
}

function deleteLabel(label, db) {
    return new Promise(function(success, error) {
        const lblPromise = db.all("DELETE FROM labels WHERE id=?", [label.id]);
        const joinTblPromise = db.all("DELETE FROM message_labels WHERE label=?", [label.id]);
        Promise.all([lblPromise, joinTblPromise]).then((results) => {
            success(label);
        }, (err) => {
            error(err);
        });
    });
}
