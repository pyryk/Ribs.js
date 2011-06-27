/**
 * @class
 * @requires Ribs.mixins.support.renderChain
 */
Ribs.mixins.support.deferredRender = {
    _renderPending: false,

    requestRender: function () {
        if (!this._renderPending) {
            this._renderPending = true;
            _.defer(_.bind(this.flushRequests, this));
        }
    },

    requestInvalidate: function () {
        this.invalidated = true;
        this.requestRender();
    },

    flushRequests: function () {
        if (this._renderPending) {
            if (_.isFunction(this.render)) {
                this.render();                
            }
            this._renderPending = false;
        }
    }
};
