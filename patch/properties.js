const { requireIfy } = require("../utils");
const propertiesMod = requireIfy("@ethersproject/properties")
const debug = require("debug")("path/properties")

function overwritePropertiesMod() {
    if(!propertiesMod){
        debug("properties mod not exist")
        return 
    }
    _oDefineReadonly()
}

function _oDefineReadonly() {
    propertiesMod.defineReadOnly = function (object, name, value) {
        // if (object[name] === undefined) {
        Object.defineProperty(object, name, {
            configurable: true,
            enumerable: true,
            value: value,
            writable: false,
        });
        // }
    }
}

module.exports = { overwritePropertiesMod }