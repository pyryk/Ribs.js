Ribs.mixins.toggleableClass = function (classOptions) {
    classOptions = classOptions || {};
    var ToggleableClassInst = function () {
            return _.extend({
                modelName: "dataUI",
                attributeName: null,
                className: classOptions.attributeName,
                inverse: false,
                
                refresh: function () {
                    var value = this.getMyValue();
                    if (this.inverse) {
                        value = !value;
                    }
                    if (this.el.hasClass(this.className) !== value) {
                        this.el.toggleClass(this.className, value);
                    }
                }
            }, Ribs.mixinBase.withModel, classOptions || {});
        };

    return ToggleableClassInst;
};
