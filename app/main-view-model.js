const Observable = require("data/observable").Observable;
const ObservableArray = require("data/observable-array").ObservableArray;
const clipboard = require("nativescript-clipboard");
const SocialShare = require("nativescript-social-share");
const Toast = require("nativescript-toast");
const utilsModule = require("tns-core-modules/utils/utils");

const Utils = require("./shared/utils").Utils;
const Converter = require("./shared/converter").Converter;

const MessageViewModel = require("./shared/view-models/message-view-model").MessageViewModel;
const MessageSqliteModel = require("./shared/processors/message-sqlite-model").MessageSqliteModel;

exports.MainViewModel = function (database) {

    const utils = new Utils();
    const converter = new Converter();

    const msgProcessor = new MessageSqliteModel(database);

    const viewModel = new Observable();
    viewModel.navContext = null;
    viewModel.justOpened = true;
    viewModel.userMsg = "";
    viewModel.desiredOutput = "U";
    viewModel.chats = new ObservableArray([]);
    viewModel.listView = null;
    viewModel.isEditing = false;
    viewModel.sideDrawer = null;

    viewModel.onLoaded = function (args) {
        const count = viewModel.chats.length;
        if (count === 0) {
            viewModel.listView.refresh(); // Refreshing list component
            loadFromDatabase(msgProcessor, viewModel, utils, function(messages) {
                if (viewModel.navContext.source === "labels") {
                    const label = viewModel.navContext.body;
                    viewModel.set("chats", viewModel.chats.filter((ele) => {
                        let ok = false;
                        ele.labels.forEach((msgLbl) => {
                            if (msgLbl.id === label.id) {
                                ok = true;
                            }
                        });

                        return ok;
                    }));
                }
                else if (viewModel.navContext.source === "filters") {
                    const navCtxBody = viewModel.navContext.body;
                    if (navCtxBody.filterText.toLowerCase() === "zawgyi") {
                        viewModel.set("chats", viewModel.chats.filter((ele) => ele.output === "zawgyi"));
                    }
                    else if (navCtxBody.filterText.toLowerCase() === "unicode") {
                        viewModel.set("chats", viewModel.chats.filter((ele) => ele.output === "unicode"));
                    }
                }
            });
        }
    };

    viewModel.onChat = function (args) {
        if (viewModel.userMsg !== "") {
            const msgObj = buildMsgObj(converter, getOutputType(viewModel.desiredOutput), viewModel.userMsg);
            msgProcessor.insert(msgObj).then(function(msg) {
                msgObj.set("messageTeaser", msgObj.message);
                msgObj.set("timestamp", utils.formatDateAmOrPm(msgObj.timestamp));
                viewModel.chats.unshift(msgObj);

                // const count = viewModel.listView.items.length;
                viewModel.listView.scrollToIndex(0);
                viewModel.set("userMsg", "");
            }, (error) => {
                console.dir(error);
            });
        }
    };

    viewModel.onCopyMsg = function (args) {
        if (viewModel.listView.getSelectedItems().length > 0) {
            let copyText = "";
            viewModel.listView.getSelectedItems().forEach((ele) => {
                if (copyText !== "") {
                    copyText += "\n";
                }
                copyText += ele.message;
            });
            clipboard.setText(copyText).then(function () {
                Toast.makeText("Copied").show();
                viewModel.onBackNav();
            });
        }
    };

    viewModel.onShareMsg = function (args) {
        if (viewModel.listView.getSelectedItems().length > 0) {
            let shareMsg = "";
            viewModel.listView.getSelectedItems().forEach((ele) => {
                if (shareMsg !== "") {
                    shareMsg += "\n";
                }
                shareMsg += ele.message;
            });
            SocialShare.shareText(shareMsg);
            viewModel.onBackNav();
        }
    };

    viewModel.onDeleteMsg = function (args) {
        if (viewModel.listView.getSelectedItems().length > 0) {
            confirm("Are you sure to delete?").then((result) => {
                if (result) {
                    // Clean from database
                    msgProcessor.deleteAll(viewModel.listView.getSelectedItems()).then((massges) => {
                        // Clean from UI
                        viewModel.listView.getSelectedItems().forEach((item) => {
                            for (let i = viewModel.chats.length; i--;) {
                                if (viewModel.chats.getItem(i).id === item.id) {
                                    viewModel.chats.splice(i, 1);
                                }
                            }
                        });
                        viewModel.listView.refresh();
                        Toast.makeText("Deleted").show();
                        viewModel.onBackNav();
                    }, (err) => {
                        console.dir(err);
                    });
                }
            });
        }
    };

    viewModel.onBackNav = function (args) {
        viewModel.set("isEditing", false);
        viewModel.listView.deselectAll();
        viewModel.chats.forEach((ele) => {
            ele.set("selected", false);
        });
    };

    viewModel.onSwitchDesiredOutput = function (args) {
        if (viewModel.desiredOutput === "U") {
            viewModel.set("desiredOutput", "Z");
        }
        else if (viewModel.desiredOutput === "Z") {
            viewModel.set("desiredOutput", "U");
        }
    };

    viewModel.onTapFilter = function (args) {
        const navigationEntry = {
            moduleName: "main-page",
            context: { source: "filters", body: { filterText: args.object.text.toLowerCase() } },
            animated: true
            // Page navigation, without saving navigation history.
            // backstackVisible: false
        };
        const page = args.object.page;
        page.frame.navigate(navigationEntry);
    };

    viewModel.onTapLabel = function (args) {
        const button = args.object;
        const page = button.page;
        const navigationEntry = {
            moduleName: "label/label-page",
            context: { messages: viewModel.listView.getSelectedItems() },
            animated: true
        };
        page.frame.navigate(navigationEntry);
    };

    viewModel.onItemSelected = function (args) {
        viewModel.set("isEditing", true);
        viewModel.listView.getItemAtIndex(args.index).set("selected", true);
    };

    viewModel.onItemDeselected = function (args) {
        viewModel.listView.getItemAtIndex(args.index).set("selected", false);
        if (viewModel.listView.getSelectedItems().length === 0) {
            viewModel.set("isEditing", false);
        }
    };

    viewModel.onItemLoading = function (args) {
        // console.log("Loading = " + args.index);
    };

    viewModel.onTapMore = function (args) {
        const bindingCtx = args.object.bindingContext;
        if (bindingCtx.hasMore) {
            bindingCtx.set("messageTeaser", bindingCtx.message);
            bindingCtx.set("hasMore", false);
        }
    };

    return viewModel;
};

function buildMsgObj(converter, type, msg) {
    const msgViewModel = new MessageViewModel();
    msgViewModel.set("output", type);
    msgViewModel.set("message", (type === "zawgyi" ? converter.unicodeToZawgyi(msg) : converter.zawgyiToUnicode(msg)));
    msgViewModel.set("timestamp", new Date());
    msgViewModel.set("onTapMsgCallback", this._onTapMsgCallback);

    return msgViewModel;
}

function getOutputType(desiredOutput) {
    if (desiredOutput === "U") {
        return "unicode";
    }
    else if (desiredOutput === "Z") {
        return "zawgyi";
    }
}

function loadFromDatabase(msgProcessor, viewModel, utils, callback) {
    msgProcessor.selectAll().then(function (messages) {
        if (messages) {
            messages.forEach((msgObj) => {
                msgObj.set("timestamp", utils.formatDateAmOrPm(new Date(msgObj.timestamp)));
                const teaserTxt = msgObj.message.length > 300 ? (msgObj.message.substring(0, 300) + '.....') : msgObj.message;
                msgObj.set("messageTeaser", teaserTxt);
                msgObj.set("hasMore", msgObj.message.length > 300);
                viewModel.chats.unshift(msgObj);
            });
            // const count = viewModel.listView.items.length;
            // viewModel.listView.scrollToIndex(count);
            if (typeof callback === "function") {
                callback(messages);
            }
        }
    }, function(error) {
        console.dir(error);
    });
}
