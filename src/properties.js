const propertiesMod = require("@ethersproject/properties")

function overwritePropertiesMod() {
    _oDefineReadonly()
}

function _oDefineReadonly() {
    propertiesMod.defineReadOnly = function (object, name, value) {

        Object.defineProperty(object, name, {
            configurable: true,
            enumerable: true,
            value: value,
            writable: false,
        });

    }
}

module.exports = { overwritePropertiesMod }