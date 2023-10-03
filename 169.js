function unique_name_88 (params) {
        let parent
        if (typeof params === 'string') {
            params = {
                content: params
            }
        }

        const defaultParam = {
            programmatic: true
        }
        if (params.parent) {
            parent = params.parent
            delete params.parent
        }
        let slot
        if (params.content) {
            slot = params.content
            delete params.content
        }
        const propsData = merge(defaultParam, params)

        const vm = typeof window !== 'undefined' && window.Vue ? window.Vue : localVueInstance || VueInstance
        const ModalComponent = vm.extend(Modal)
        const component = new ModalComponent({
            parent,
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
        return component
    }