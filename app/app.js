/*
In NativeScript, the app.js file is the entry point to your application.
You can use this file to perform app-level initialization, but the primary
purpose of the file is to pass control to the app’s first module.
*/

require("./bundle-config");
const application = require("application");
const frame = require('ui/frame');

function androidBackEvent(args) {
    const currentPage = frame.topmost().currentPage;
    if (currentPage && currentPage.exports && typeof currentPage.exports.androidBackEvent === "function") {
         currentPage.exports.androidBackEvent(args);
    }
}

if (application.android) {
    application.android.on(application.AndroidApplication.activityBackPressedEvent, androidBackEvent);
}

// application.start({ moduleName: "main-page" });
application.run({ moduleName: "app-root" });

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/
