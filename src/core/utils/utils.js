/**
 * @method
 * @desc Internal logging method.
 * @param msg
 */
Ribs.utils.log = Ribs.log = function (msg) {
    if (typeof(console) !== "undefined") {
        console.log(msg);
    }
};

/**
 * @method
 */
Ribs.utils.compose = Ribs.compose = function () {
    var obj = {};
    _.each(arguments, function(sourceDef) {
        var source = _.isString(sourceDef) ? Ribs.mixinParser.parseMixin(sourceDef) : sourceDef;
        if (source === undefined || source === null) {
            Ribs.throwError("extendingWithUndefinedOrNull", sourceDef);
        }
        for (var prop in source) {
            if (_.isFunction(obj[prop])) {
                if (_.isFunction(source[prop])) {
                    obj[prop] = _.compose(source[prop], obj[prop]);
                } else {
                    Ribs.throwError("addingExtendFunctionWithNonFunction");
                }
            } else if (_.isArray(obj[prop])) {
                if (_.isArray(source[prop])) {
                    obj[prop] = obj[prop].concat(source[prop]);
                } else {
                    Ribs.throwError("addingExtendArrayWithNonArray");
                }
            } else if (source[prop] !== null) {
                obj[prop] = source[prop];
            }
        }
    });
    return obj;
};

/**
 * @method
 * @param obj
 * @param path
 */
Ribs.utils.findObject = function (obj, path) {
    var splitPath = path.split(".");
    _.each(splitPath, function (elem) {
        if (obj.hasOwnProperty(elem)) {
            obj = obj[elem];
        } else {
            Ribs.throwError("invalidObjectPath", path);
        }
    });
    return obj;
};
