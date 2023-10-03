function unique_name_89 (params) {
        let parent
        if (typeof params === 'string') {
            params = {
                message: params
            }
        }

        const defaultParam = {
            position: config.defaultNotificationPosition || 'is-top-right'
        }
        if (params.parent) {
            parent = params.parent
            delete params.parent
        }
        const slot = params.message
        delete params.message
        // fix animation
        params.active = false
        const propsData = merge(defaultParam, params)
        const vm = typeof window !== 'undefined' && window.Vue ? window.Vue : localVueInstance || VueInstance
        const NotificationNoticeComponent = vm.extend(NotificationNotice)
        const component = new NotificationNoticeComponent({
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
        // fix animation
        component.$children[0].isActive = true
        return component
    }