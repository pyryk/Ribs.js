Ribs.mixins.plain = Ribs.support.mixins.eventful;
Ribs.mixins.composite = Ribs.utils.addingExtend({},
        Ribs.support.mixins.methodInherit,
        Ribs.support.mixins.compositeBase,
        Ribs.support.mixins.childMixinElementResolver
    );
Ribs.mixins.templated = Ribs.utils.addingExtend({},
        { redraw: Ribs.support.functions.resolveJSON },
        { redraw: Ribs.support.functions.resolveValue },
        Ribs.support.mixins.templated
    );

