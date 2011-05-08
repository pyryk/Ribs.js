Ribs.mixins.editableText = function (classOptions) {
    classOptions = classOptions || {};
    
    var EditableTextInst = Ribs.mixins.mixinComposite(_.extend(classOptions, {
        mixins: [
            { mixinComposite: {
                elementCreator: "<span>moi</span>",
                mixins: [
                    { toggleableElement: { uiAttributeName: "editing", inverse: true } }
                ]
            }},
            { mixinComposite: {
                elementCreator: "<input type=\"text\" />",
                mixins: [
                    { toggleableElement: { uiAttributeName: "editing" } },
                    { textValueEdit: {
                        attributeName: classOptions.attributeName,
                        uiAttributeName: classOptions.uiAttributeName
                    }}
                ]
            }}
        ]
    }));

    Ribs.readMixinOptions(EditableTextInst, classOptions);
    return EditableTextInst;
};
