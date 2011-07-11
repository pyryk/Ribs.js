/**
 * @class
 */
Ribs.mixins.support.functions.resolveValue = function () {
    if (this.pivot && _.isFunction(this.pivot.getValue)) {
        this.value = this.pivot.getValue(this);
    }
};

/**
 * @class
 */
Ribs.mixins.support.functions.resolveJSON = function () {
    if (this.pivot && _.isFunction(this.pivot.getModelJSON)) {
        this.json = this.pivot.getModelJSON(this);
    }
};
