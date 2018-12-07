const Observable = require("data/observable").Observable;
const ObservableArray = require("data/observable-array").ObservableArray;
const platformModule = require("tns-core-modules/platform");


exports.MessageViewModel = function () {

    const viewModel = new Observable();

    viewModel.id = "";
    viewModel.output = "";
    viewModel.message = "";
    viewModel.messageTeaser = "";
    viewModel.labels = new ObservableArray([]);
    viewModel.selected = false;
    viewModel.hasMore = false;
    viewModel.timestamp = null;
    viewModel.onTapMsgCallback = null;
    viewModel.onLoadedMsgCallBack = null;

    viewModel.onLoaded = function (event) {
        // if (platformModule.isAndroid) {
        //     event.object.nativeView.setTextIsSelectable(true);
        // }
        // if (typeof this.onLoadedMsgCallBack === "function") {
        //     this.onLoadedMsgCallBack(event);
        // }
    };

    viewModel.onTapMsg = function (args) {
        // const layout = args.view;
        // const bindingCtx = layout.bindingContext;
        // bindingCtx.selected = !bindingCtx.selected;
        // if (bindingCtx.selected) {
        //     layout.className = "card-style-selected";
        // }
        // else {
        //     layout.className = (bindingCtx.output === "unicode" ? "unicode-card-style" : "zawgyi-card-style");
        // }
        // if (typeof this.onTapMsgCallback === "function") {
        //     this.onTapMsgCallback(args);
        // }
    };

    return viewModel;

};
