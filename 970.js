function unique_name_561 (emitter, notification) {

    if (notification) {
        emitter._notificationsQueue.push(notification);
    }

    if (emitter._eventsProcessing ||
        !emitter._notificationsQueue.length) {

        return;
    }

    emitter._eventsProcessing = true;
    const item = emitter._notificationsQueue.shift();

    const event = emitter._eventListeners[item.criteria.name];
    const handlers = event.handlers;

    const finalize = () => {

        if (item.callback) {
            process.nextTick(itemCallback, item);
        }

        emitter._eventsProcessing = false;
        process.nextTick(emitEmitter, emitter);
    };

    let data = item.data;
    let generated = item.generated;

    const relay = () => {

        if (!emitter._sourcePodiums.length) {
            return finalize();
        }

        const each = (podium, next) => podium._emit(item.criteria, data, generated, next);        // User _emit() in case emit() was modified
        Items.parallel(emitter._sourcePodiums.slice(), each, finalize);
    };

    if (!handlers) {
        return relay();
    }

    const each = (handler, next) => {

        if (handler.count) {
            --handler.count;
            if (handler.count < 1) {
                internals.removeHandler(emitter, item.criteria.name, handler);
            }
        }

        const invoke = (func) => {

            if (handler.channels &&
                (!item.criteria.channel || handler.channels.indexOf(item.criteria.channel) === -1)) {

                return;
            }

            if (handler.filter) {
                if (!item.criteria.tags) {
                    return;
                }

                const match = Hoek.intersect(item.criteria.tags, handler.filter.tags, !handler.filter.all);
                if (!match ||
                    (handler.filter.all && match.length !== handler.filter.tags.length)) {

                    return;
                }
            }

            if (!generated &&
                typeof data === 'function') {

                data = item.data();
                generated = true;
            }

            const update = (internals.flag('clone', handler, event) ? Hoek.clone(data) : data);
            const args = (internals.flag('spread', handler, event) && Array.isArray(update) ? update : [update]);

            if (internals.flag('tags', handler, event) &&
                item.criteria.tags) {

                args.push(item.criteria.tags);
            }

            if (func) {
                args.push(func);
            }

            handler.listener.apply(null, args);
        };

        if (!handler.block) {
            invoke();
            return next();
        }

        let timer = null;
        if (handler.block !== true) {
            next = Hoek.once(next);
            timer = setTimeout(next, handler.block);
        }

        invoke(() => {

            clearTimeout(timer);
            return next();
        });
    };

    return Items.parallel(handlers.slice(), each, relay);        // Clone in case handlers are changed by listeners
}