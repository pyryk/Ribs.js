Ribs.mixins.editable = function (classOptions) {
    var EditableInst = Ribs.mixinParser.createCompositeFromDefinitions([
        { toggleAttribute: {
            attributeName: "editing",
            modelName: "dataUI",
            onEvent: "click",
            offEvent: "click"
        }},
        { toggleableClass: {
            attributeName: "editing",
            modelName: "dataUI",
            className: "editing"
        }}
    ], classOptions);

    return EditableInst;
};
