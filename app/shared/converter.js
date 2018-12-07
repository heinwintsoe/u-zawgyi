const Observable = require("data/observable").Observable;
const config = require("../shared/config");

exports.Converter = function () {

    const observable = new Observable();

    observable.unicodeToZawgyi = function (uincode) {

        return this.replaceWithRule(config.convertionRules.unicodeToZawgyi, uincode);

    };

    observable.zawgyiToUnicode = function (zawgyi) {

        return this.replaceWithRule(config.convertionRules.zawgyiToUnicode, zawgyi);

    };

    observable.replaceWithRule = (rule, input) => {
        const maxLoop = rule.length;
        for (let i = 0; i < maxLoop; i++) {

            const data = rule[i];
            const from = data["from"];
            const to = data["to"];

            const fromRegex = new RegExp(from, "g");
            input = input.replace(fromRegex, to);
        }

        return input;
    };

    return observable;
};
