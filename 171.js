function unique_name_90 (params) {
        let parent
        if (typeof params === 'string') {
            params = {
                message: params
            }
        }

        const defaultParam = {
            type: 'is-success',
            position: config.defaultSnackbarPosition || 'is-bottom-right'
        }
        if (params.parent) {
            parent = params.parent
            delete params.parent
        }
        const slot = params.message
        delete params.message
        const propsData = merge(defaultParam, params)

        const vm = typeof window !== 'undefined' && window.Vue ? window.Vue : localVueInstance || VueInstance
        const SnackbarComponent = vm.extend(Snackbar)
        const component = new SnackbarComponent({
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