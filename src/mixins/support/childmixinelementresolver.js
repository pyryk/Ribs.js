Ribs.mixinBase.childMixinElementResolver = {
    redraw: function () {
        if (this.mixins) {
            var el = $(this.el).find(this.elementSelector);
            if (el.length === 0) {
                el = this.el;
            }
            _.each(this.mixins, function (mixin) {
                mixin.el = mixin.elementSelector ? el.find(mixin.elementSelector) : el;
                if (typeof(mixin.redraw) === "function") {
                    mixin.redraw.apply(mixin, []);
                }
            });
        }
    }
};
