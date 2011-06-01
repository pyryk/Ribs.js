Ribs.mixinBase.composite = {
    inheritingMethods: null,
    mixinClasses: [],
    mixinInitialize: function () {
        this.inheritingMethods = this.inheritingMethods || [];
        this.mixins = [];
        _.each(this.mixinClasses, _.bind(function (mixinType) {
            if (typeof(mixinType === "function")) {
                mixin = mixinType();
            } else {
                mixin = _.clone(mixinType);
            }
            _.extend(mixin, {
                inheritingMethods: this.inheritingMethods,
                pivot: this.pivot
            });
            _.bind(function () { _.bindAll(this); }, mixin)();
            this.mixins.push(mixin);
        }, this));
        this.callAllMixins(this.mixins, "mixinInitialize", arguments);
        this.initializeInheritingMethods(this);
    },
    callAllMixins: function (methodName, originalArguments) {
        _.each(this.mixins, function (mixin) {
            if (typeof(mixin[methodName]) === "function") {
                mixin[methodName].apply(mixin, originalArguments);
            }
        });
    },
    initializeInheritingMethods: function () {
        _.each(this.inheritingMethods, function (methodName) {
            var oldMethod = this.prototype[methodName];
            this.prototype[methodName] = function () {
                if (typeof(oldMethod) === "function") {
                    oldMethod.apply(this, arguments);
                }
                this.callAllMixins(this.mixins, methodName, arguments);
            };
        });
    }
};

