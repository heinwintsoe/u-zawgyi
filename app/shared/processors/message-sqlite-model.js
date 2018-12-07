const Observable = require("data/observable").Observable;
const ObservableArray = require("data/observable-array").ObservableArray;

const MessageViewModel = require("../../shared/view-models/message-view-model").MessageViewModel;
const LabelObservable = require("../../label/label-observable");

exports.MessageSqliteModel = function (database) {

    const viewModel = new Observable();

    viewModel.insert = function(msg) {
        return new Promise(function (success, error) {
            database.execSQL("INSERT INTO messages (output, message, createdDateTime) VALUES (?, ?, ?)",
                [msg.output, msg.message, msg.timestamp])
                .then((id) => {
                    msg.set("id", id);

                    success(msg);
                }, (err) => {
                    error(err);
            });
        });
    };

    viewModel.delete = function (msg) {
        return new Promise(function (success, error) {
            database.execSQL("DELETE FROM messages WHERE id=?", [msg.id])
                .then((count) => {
                    success(msg);
                }, (err) => {
                    error(err);
            });
        });
    };

    viewModel.deleteAll = function (messages) {
        return new Promise(function (success, error) {
            messages.forEach((msg) => {
                viewModel.delete(msg)
                .then((msg) => {
                    console.log("DELETED Message - ", msg.id);
                }, (err) => {
                    error(err);
                });
            });
            success(messages);
        });
    };

    viewModel.selectAll = function() {
        return new Promise(function(success, error) {
            database.all("SELECT * FROM messages")
                .then((rows) => {
                    const messages = new ObservableArray([]);
                    rows.forEach((row) => {
                        const msgViewModel = new MessageViewModel();
                        msgViewModel.set("id", row[0]);
                        msgViewModel.set("output", row[1]);
                        msgViewModel.set("message", row[2]);
                        msgViewModel.set("timestamp", row[3]);
                        loadRelatedLabels(row[0], database).then((labels) => {
                            msgViewModel.set("labels", labels);
                            messages.push(msgViewModel);
                            success(messages);
                        }, (err) => {
                            error(err);
                        });
                    });
                }, (err) => {
                    error(err);
                });
        });
    };

    return viewModel;
};

function loadRelatedLabels(msgId, database) {
    return new Promise(function(success, error) {
        database.all("SELECT * FROM labels WHERE id IN (SELECT label FROM message_labels WHERE message=?)", [msgId])
            .then((rows) => {
                const labels = new ObservableArray([]);
                rows.forEach((row) => {
                    const label = LabelObservable.fromParams(row[0], row[1], false, row[2]);
                    labels.push(label);
                });
                success(labels);
            }, (err) => {
                error(err);
            });
    });
}
