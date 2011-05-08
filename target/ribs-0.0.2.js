(function(){
    var Ribs;

    Ribs = this.Ribs = {};

    Ribs.VERSION = '0.0.2';

    Ribs.mixins = {};

    Ribs.augmentModelWithUIAttributes = function (model) {
        if (!model.hasOwnProperty("ribsUI")) {
            model.ribsUI = new Backbone.Model();
            model.ribsUI.safeUnbind = function (ev, callback) {
                var calls;
                if (!ev) {
                    this._callbacks = {};
                } else if (calls = this._callbacks) {
                    if (!callback) {
                        calls[ev] = [];
                    } else {
                        var list = calls[ev];
                        if (!list) return this;
                        for (var i = 0, l = list.length; i < l; i++) {
                            if (callback === list[i]) {
                                list[i] = function () { };
                                break;
                            }
                        }
                    }
                }
                return this;
            };
            model.ribsUI.set({ owner: model });
            model.ribsUI.bind("all", function (event) {
                model.trigger("ribsUI:" + event, Array.prototype.slice.call(arguments, 1));
            });
        }
    };

    Ribs.createMixed = function (myOptions) {
        myOptions = myOptions || {};

        var requireModel = myOptions.hasOwnProperty("requireModel") ? myOptions.requireModel : true,
            mixinClasses = myOptions.mixinClasses,
            Buildee = Ribs.ManagedView.extend(),
            delegateOneToMixins = function (methodName) {
                Buildee.prototype[methodName] = function () {
                    var doIt = function () {
                        Ribs.ManagedView.prototype[methodName].apply(this, arguments);
                        _.each(this.mixins, _.bind(function (mixin) {
                            mixin[methodName] && mixin[methodName].apply(this, arguments);
                        }, this));
                    };

                    doIt.apply(this, arguments);
                }
            },
            delegateToMixins = function (methods) {
                _.each(methods, function (methodName) { delegateOneToMixins(methodName); });
            };

        Buildee.prototype.initialize = function () {
            if (requireModel && !this.model) {
                throw "No model specified and requireModel==true";
            }
            this.mixins = [];
            _.each(mixinClasses, _.bind(function (Mixin) {
                this.mixins.push(new Mixin(this.options));
            }, this));
            Ribs.ManagedView.prototype.initialize.apply(this, arguments);
        };

        delegateToMixins(["customInitialize", "modelChanged", "render", "redraw", "refresh", "hide", "dispose"]);

        return Buildee;
    };

})();

Ribs.ManagedView = Backbone.View.extend({
    invalidated: true,
    refreshOnlyIfVisible: false,

    initialize: function () {
        _.bindAll(this, "customInitialize", "bindToModel", "modelChanged", "render", "redraw", "refresh", "hide", "dispose");
        Backbone.View.prototype.initialize.apply(this, arguments);
        this.model && this.bindToModel(this.model);
        this.customInitialize();
        this.render();
    },
    customInitialize: function () { },
    bindToModel: function (model) {
        this.model && this.model.ribsUI && this.model.ribsUI.safeUnbind("all", this.render);
        this.model = model;
        this.model && Ribs.augmentModelWithUIAttributes(this.model);
        this.modelChanged();
        this.model && this.model.ribsUI.bind("all", this.render);
    },
    modelChanged: function () { },
    render: function () {
        if (!this.model) {
            return;
        }
        
        if (this.invalidated) {
            this.redraw();
            this.invalidated = false;
        }
        if (!this.refreshOnlyIfVisible || $(this.el).is(":visible")) {
            this.refresh();
        }
    },
    redraw: function () { },
    refresh: function () { },
    hide: function () {
        $(this.el).detach();
    },
    dispose: function () {
        $(this.el).remove();
    }
});

Ribs.createUIManager = function (key, myOptions) {
    myOptions = myOptions || {};

    Ribs.uiManagers = Ribs.uiManagers || {};

    Ribs.uiManagers[key] = function () {
        var allowMultiselect = myOptions.allowMultiselect,
            viewModel = new Backbone.Model({ nowHovering: null, nowSelected: null }),
            hoveringChanged = function (event) {
                var item = event[0];
                if (item === viewModel.get("nowHovering") && !item.get("hovering")) {
                    viewModel.set({ nowHovering: null });
                } else if (item !== viewModel.get("nowHovering") && item.get("hovering")) {
                    var lastHovering = viewModel.get("nowHovering");
                    viewModel.set({ nowHovering: item });
                    lastHovering && lastHovering.set({ hovering: false });
                }
            },
            selectedChanged = function (event) {
                var item = event[0];
                if (item === viewModel.get("nowSelected") && !item.get("selected")) {
                    viewModel.set({ nowSelected: null });
                } else if (item !== viewModel.get("nowSelected") && item.get("selected")) {
                    var lastSelected = viewModel.get("nowSelected");
                    viewModel.set({ nowSelected: item });
                    if (!allowMultiselect) {
                        lastSelected && lastSelected.set({ selected: false });
                    }
                }
            },
            register = function (model) {
                if (model) {
                    unregister(model);
                    model.bind("ribsUI:change:hovering", hoveringChanged);
                    model.bind("ribsUI:change:selected", selectedChanged);
                }
            },
            unregister = function (model) {
                if (model) {
                    model.unbind("ribsUI:change:hovering", hoveringChanged);
                    model.unbind("ribsUI:change:selected", selectedChanged);
                }
            };

        return {
            register: register,
            unregister: unregister,
            getViewModel: function () { return viewModel; }
        }
    }();       
};

Ribs.mixins.Hoverable = function (myOptions) {
    myOptions = myOptions || {};

    var elementSelector = myOptions.elementSelector,
        HoverableClosure = function () {
            var that,
                mouseOver = function () {
                    that.model.ribsUI.set({ hovering: true });
                },
                mouseOut = function () {
                    that.model.ribsUI.set({ hovering: false });
                };

            return {
                customInitialize: function () {
                    that = this;
                },
                modelChanged: function () {
                    this.model && this.model.ribsUI.set({ hovering: false });
                },
                refresh: function () {
                    var $elem = elementSelector ? $(this.el).find(elementSelector) : $(this.el);
                    $elem
                            .unbind("mouseenter", mouseOver)
                            .unbind("mouseleave", mouseOut)
                            .mouseenter(mouseOver)
                            .mouseleave(mouseOut)
                            .toggleClass("hovering", this.model.ribsUI.get("hovering"));
                }
            };
        };

    return HoverableClosure;
};

Ribs.mixins.Selectable = function (myOptions) {
    myOptions = myOptions || {};

    var elementSelector = myOptions.elementSelector,
        SelectableClosure = function () {
            var that, elementClicked = function () {
                that.model.ribsUI.set({ selected: !that.model.ribsUI.get("selected") });
            };

            return {
                customInitialize: function () {
                    that = this;
                },
                modelChanged: function () {
                    this.model && this.model.ribsUI.set({ selected: false });
                },
                refresh: function () {
                    var $elem = elementSelector ? $(this.el).find(elementSelector) : $(this.el);
                    $elem
                            .unbind("click", elementClicked)
                            .bind("click", elementClicked)
                            .toggleClass("selected", this.model.ribsUI.get("selected"));
                }
            };
        };

    return SelectableClosure;
};

Ribs.mixins.SimpleList = function (myOptions) {
    myOptions = myOptions || {};

    var elementSelector = myOptions.elementSelector,
        listAttributeName = myOptions.listAttributeName,
        ItemRenderer = myOptions.ItemRenderer,
        SimpleListClosure = function () {
            var that, listModel, listViews,
                addOne = function (item) {
                    if (!listViews.hasOwnProperty(item.cid)) {
                        var listView = new ItemRenderer({ model: item });
                        listViews[item.cid] = listView;
                        invalidated = true;
                    }
                },
                addAll = function () {
                    listModel.each(addOne);
                },
                removeOne = function (item) {
                    delete listViews[item.cid];
                    $(item.el).remove();
                };

            return {
                customInitialize: function () {
                    that = this;
                },
                modelChanged: function () {
                    _.each(listViews, function (view) {
                        view.dispose();
                    });
                    listViews = {};
                    if (listModel) {
                        listModel.unbind("add", addOne);
                        listModel.unbind("remove", removeOne);
                        listModel.unbind("refresh", addAll);
                    }
                    if (this.model) {
                        listModel = listAttributeName ? this.model.get(listAttributeName) : this.model;
                        listModel.bind("add", addOne);
                        listModel.bind("remove", removeOne);
                        listModel.bind("refresh", addAll);
                        addAll();
                    } else {
                        this.model = null;
                    }
                },
                redraw: function () {
                    var $elem = elementSelector ? $(this.el).find(elementSelector) : $(this.el);
                    $elem.children().detach();
                    _.each(listViews, function (view) {
                        $elem.append(view.el);
                    });
                },
                render: function () {
                    _.each(listViews, function (view) {
                        view.render();
                    });
                }
            };
        };

    return SimpleListClosure;
};

Ribs.mixins.Templated = function (myOptions) {
    myOptions = myOptions || {};

    var tagClass = myOptions.tagClass,
        templateFunction = myOptions.templateFunction,
        TemplatedClosure = function () {
            return {
                modelChanged: function () {
                    if (!this.model) {
                        this.redraw();
                    }
                },
                redraw: function () {
                    var json = this.model ? (this.model.toJSON ? this.model.toJSON() : this.model) : {};
                    json.t = function (name) {
                        return this.hasOwnProperty(name) ? this[name] : "";
                    };
                    $(this.el).html(templateFunction(json));
                    tagClass && $(this.el).toggleClass(tagClass, true);
                }
            };
        };

    return TemplatedClosure;
};

Ribs.mixins.ToggleableElement = function (myOptions) {
    myOptions = myOptions || {};

    var elementSelector = myOptions.elementSelector,
        ToggleableElementClosure = function () {
            var that,
                openChanged = function () {
                    that && (that.invalidated = true);
                };

            return {
                customInitialize: function () {
                    that = this;
                },
                modelChanged: function () {
                    this.model && this.model.ribsUI.bind("change:open", openChanged);
                },
                redraw: function () {
                    var $elem = elementSelector ? $(this.el).find(elementSelector) : $(this.el);
                    $elem.toggle(this.model.ribsUI.get("open"));
                }
            };
        };

    return ToggleableElementClosure;
};

Ribs.mixins.ToggleButton = function (myOptions) {
    myOptions = myOptions || {};

    var elementSelector = myOptions.elementSelector,
        usePlusMinus = myOptions.usePlusMinus,
        ToggleableClosure = function () {
            var that,
                toggle = function () {
                    that.model.ribsUI.set({ open: !that.model.ribsUI.get("open") });
                };

            return {
                customInitialize: function () {
                    that = this;
                },
                modelChanged: function () {
                    this.model && this.model.ribsUI.set({ open: false });
                },
                refresh: function () {
                    var $elem = elementSelector ? $(this.el).find(elementSelector) : $(this.el);
                    $elem
                            .unbind("click", toggle)
                            .bind("click", toggle);
                    if (usePlusMinus) {
                        $elem.text(this.model.ribsUI.get("open") ? "-" : "+");
                    }
                }
            };
        };

    return ToggleableClosure;
};
