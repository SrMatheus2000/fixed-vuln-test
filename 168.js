function open(propsData) {
    const slot = propsData.message
    delete propsData.message
    const vm = typeof window !== 'undefined' && window.Vue ? window.Vue : localVueInstance || VueInstance
    const DialogComponent = vm.extend(Dialog)
    const component = new DialogComponent({
        el: document.createElement('div'),
        propsData
    })
    if (slot) {
        const CustomSlot = vm.extend({
            template: `<div>${slot}</div>`
        })
        component.$slots.default = new CustomSlot().$mount()._vnode
        component.$forceUpdate()
    }
    if (!config.defaultProgrammaticPromise) {
        return component
    } else {
        return new Promise((resolve) => {
            component.$on('confirm', (event) => resolve({ result: event || true, dialog: component }))
            component.$on('cancel', () => resolve({ result: false, dialog: component }))
        })
    }
}