function unique_name_391 () {
            /* The initialize function gets called as soon as the plugin is
             * loaded by converse.js's plugin machinery.
             */
            const { _converse } = this,
                  { __ } = _converse;

            // Configuration values for this plugin
            // ====================================
            // Refer to docs/source/configuration.rst for explanations of these
            // configuration settings.
            _converse.api.settings.update({
                allow_bookmarks: true,
                hide_open_bookmarks: true
            });
            // Promises exposed by this plugin
            _converse.api.promises.add('bookmarksInitialized');

            // Pure functions on the _converse object
            _.extend(_converse, {
                removeBookmarkViaEvent (ev) {
                    /* Remove a bookmark as determined by the passed in
                     * event.
                     */
                    ev.preventDefault();
                    const name = ev.target.getAttribute('data-bookmark-name');
                    const jid = ev.target.getAttribute('data-room-jid');
                    if (confirm(__("Are you sure you want to remove the bookmark \"%1$s\"?", name))) {
                        _.invokeMap(_converse.bookmarks.where({'jid': jid}), Backbone.Model.prototype.destroy);
                    }
                },

                addBookmarkViaEvent (ev) {
                    /* Add a bookmark as determined by the passed in
                     * event.
                     */
                    ev.preventDefault();
                    const jid = ev.target.getAttribute('data-room-jid');
                    const chatroom = _converse.api.rooms.open(jid, {'bring_to_foreground': true});
                    _converse.chatboxviews.get(jid).renderBookmarkForm();
                },
            });

            _converse.Bookmark = Backbone.Model;

            _converse.Bookmarks = Backbone.Collection.extend({
                model: _converse.Bookmark,
                comparator: 'name',

                initialize () {
                    this.on('add', _.flow(this.openBookmarkedRoom, this.markRoomAsBookmarked));
                    this.on('remove', this.markRoomAsUnbookmarked, this);
                    this.on('remove', this.sendBookmarkStanza, this);

                    const cache_key = `converse.room-bookmarks${_converse.bare_jid}`;
                    this.fetched_flag = b64_sha1(cache_key+'fetched');
                    this.browserStorage = new Backbone.BrowserStorage[_converse.storage](
                        b64_sha1(cache_key)
                    );
                },

                openBookmarkedRoom (bookmark) {
                    if (bookmark.get('autojoin')) {
                        _converse.api.rooms.open(bookmark.get('jid'), bookmark.get('nick'));
                    }
                    return bookmark;
                },

                fetchBookmarks () {
                    const deferred = u.getResolveablePromise();
                    if (this.browserStorage.records.length > 0) {
                        this.fetch({
                            'success': _.bind(this.onCachedBookmarksFetched, this, deferred),
                            'error':  _.bind(this.onCachedBookmarksFetched, this, deferred)
                        });
                    } else if (! window.sessionStorage.getItem(this.fetched_flag)) {
                        // There aren't any cached bookmarks and the
                        // `fetched_flag` is off, so we query the XMPP server.
                        // If nothing is returned from the XMPP server, we set
                        // the `fetched_flag` to avoid calling the server again.
                        this.fetchBookmarksFromServer(deferred);
                    } else {
                        deferred.resolve();
                    }
                    return deferred;
                },

                onCachedBookmarksFetched (deferred) {
                    return deferred.resolve();
                },

                createBookmark (options) {
                    _converse.bookmarks.create(options);
                    _converse.bookmarks.sendBookmarkStanza();
                },

                sendBookmarkStanza () {
                    let stanza = $iq({
                            'type': 'set',
                            'from': _converse.connection.jid,
                        })
                        .c('pubsub', {'xmlns': Strophe.NS.PUBSUB})
                            .c('publish', {'node': 'storage:bookmarks'})
                                .c('item', {'id': 'current'})
                                    .c('storage', {'xmlns':'storage:bookmarks'});
                    this.each(function (model) {
                        stanza = stanza.c('conference', {
                            'name': model.get('name'),
                            'autojoin': model.get('autojoin'),
                            'jid': model.get('jid'),
                        }).c('nick').t(model.get('nick')).up().up();
                    });
                    stanza.up().up().up();
                    stanza.c('publish-options')
                        .c('x', {'xmlns': Strophe.NS.XFORM, 'type':'submit'})
                            .c('field', {'var':'FORM_TYPE', 'type':'hidden'})
                                .c('value').t('http://jabber.org/protocol/pubsub#publish-options').up().up()
                            .c('field', {'var':'pubsub#persist_items'})
                                .c('value').t('true').up().up()
                            .c('field', {'var':'pubsub#access_model'})
                                .c('value').t('whitelist');
                    _converse.connection.sendIQ(stanza, null, this.onBookmarkError.bind(this));
                },

                onBookmarkError (iq) {
                    _converse.log("Error while trying to add bookmark", Strophe.LogLevel.ERROR);
                    _converse.log(iq);
                    // We remove all locally cached bookmarks and fetch them
                    // again from the server.
                    this.reset();
                    this.fetchBookmarksFromServer(null);
                    window.alert(__("Sorry, something went wrong while trying to save your bookmark."));
                },

                fetchBookmarksFromServer (deferred) {
                    const stanza = $iq({
                        'from': _converse.connection.jid,
                        'type': 'get',
                    }).c('pubsub', {'xmlns': Strophe.NS.PUBSUB})
                        .c('items', {'node': 'storage:bookmarks'});
                    _converse.connection.sendIQ(
                        stanza,
                        _.bind(this.onBookmarksReceived, this, deferred),
                        _.bind(this.onBookmarksReceivedError, this, deferred)
                    );
                },

                markRoomAsBookmarked (bookmark) {
                    const room = _converse.chatboxes.get(bookmark.get('jid'));
                    if (!_.isUndefined(room)) {
                        room.save('bookmarked', true);
                    }
                },

                markRoomAsUnbookmarked (bookmark) {
                    const room = _converse.chatboxes.get(bookmark.get('jid'));
                    if (!_.isUndefined(room)) {
                        room.save('bookmarked', false);
                    }
                },

                createBookmarksFromStanza (stanza) {
                    const bookmarks = sizzle(
                        'items[node="storage:bookmarks"] '+
                        'item#current '+
                        'storage[xmlns="storage:bookmarks"] '+
                        'conference',
                        stanza
                    )
                    _.forEach(bookmarks, (bookmark) => {
                        this.create({
                            'jid': bookmark.getAttribute('jid'),
                            'name': bookmark.getAttribute('name'),
                            'autojoin': bookmark.getAttribute('autojoin') === 'true',
                            'nick': bookmark.querySelector('nick').textContent
                        });
                    });
                },

                onBookmarksReceived (deferred, iq) {
                    this.createBookmarksFromStanza(iq);
                    if (!_.isUndefined(deferred)) {
                        return deferred.resolve();
                    }
                },

                onBookmarksReceivedError (deferred, iq) {
                    window.sessionStorage.setItem(this.fetched_flag, true);
                    _converse.log('Error while fetching bookmarks', Strophe.LogLevel.WARN);
                    _converse.log(iq.outerHTML, Strophe.LogLevel.DEBUG);
                    if (!_.isNil(deferred)) {
                        if (iq.querySelector('error[type="cancel"] item-not-found')) {
                            // Not an exception, the user simply doesn't have
                            // any bookmarks.
                            return deferred.resolve();
                        } else {
                            return deferred.reject(new Error("Could not fetch bookmarks"));
                        }
                    }
                }
            });

            _converse.BookmarksList = Backbone.Model.extend({
                defaults: {
                    "toggle-state":  _converse.OPENED
                }
            });

            _converse.BookmarkView = Backbone.VDOMView.extend({
                toHTML () {
                    return tpl_bookmark({
                        'hidden': _converse.hide_open_bookmarks &&
                                  _converse.chatboxes.where({'jid': this.model.get('jid')}).length,
                        'bookmarked': true,
                        'info_leave_room': __('Leave this room'),
                        'info_remove': __('Remove this bookmark'),
                        'info_remove_bookmark': __('Unbookmark this room'),
                        'info_title': __('Show more information on this room'),
                        'jid': this.model.get('jid'),
                        'name': this.model.get('name'),
                        'open_title': __('Click to open this room')
                    });
                }
            });

            _converse.BookmarksView = Backbone.OrderedListView.extend({
                tagName: 'div',
                className: 'bookmarks-list rooms-list-container',
                events: {
                    'click .add-bookmark': 'addBookmark',
                    'click .bookmarks-toggle': 'toggleBookmarksList',
                    'click .remove-bookmark': 'removeBookmark'
                },
                listSelector: '.rooms-list',
                ItemView: _converse.BookmarkView,
                subviewIndex: 'jid',

                initialize () {
                    Backbone.OrderedListView.prototype.initialize.apply(this, arguments);

                    this.model.on('add', this.showOrHide, this);
                    this.model.on('remove', this.showOrHide, this);

                    _converse.chatboxes.on('add', this.renderBookmarkListElement, this);
                    _converse.chatboxes.on('remove', this.renderBookmarkListElement, this);

                    const cachekey = `converse.room-bookmarks${_converse.bare_jid}-list-model`;
                    this.list_model = new _converse.BookmarksList();
                    this.list_model.id = cachekey;
                    this.list_model.browserStorage = new Backbone.BrowserStorage[_converse.storage](
                        b64_sha1(cachekey)
                    );
                    this.list_model.fetch();
                    this.render();
                    this.sortAndPositionAllItems();
                },

                render () {
                    this.el.innerHTML = tpl_bookmarks_list({
                        'toggle_state': this.list_model.get('toggle-state'),
                        'desc_bookmarks': __('Click to toggle the bookmarks list'),
                        'label_bookmarks': __('Bookmarks'),
                        '_converse': _converse
                    });
                    this.showOrHide();
                    this.insertIntoControlBox();
                    return this;
                },

                insertIntoControlBox () {
                    const controlboxview = _converse.chatboxviews.get('controlbox');
                    if (!_.isUndefined(controlboxview) &&
                            !document.body.contains(this.el)) {
                        const container = controlboxview.el.querySelector('#chatrooms');
                        if (!_.isNull(container)) {
                            container.insertBefore(this.el, container.firstChild);
                        }
                    }
                },

                removeBookmark: _converse.removeBookmarkViaEvent,
                addBookmark: _converse.addBookmarkViaEvent,

                renderBookmarkListElement (chatbox) {
                    const bookmarkview = this.get(chatbox.get('jid'));
                    if (_.isNil(bookmarkview)) {
                        // A chat box has been closed, but we don't have a
                        // bookmark for it, so nothing further to do here.
                        return;
                    }
                    bookmarkview.render();
                    this.showOrHide();
                },

                showOrHide (item) {
                    if (_converse.hide_open_bookmarks) {
                        const bookmarks = this.model.filter((bookmark) =>
                                !_converse.chatboxes.get(bookmark.get('jid')));
                        if (!bookmarks.length) {
                            u.hideElement(this.el);
                            return;
                        }
                    }
                    if (this.model.models.length) {
                        u.showElement(this.el);
                    }
                },

                toggleBookmarksList (ev) {
                    if (ev && ev.preventDefault) { ev.preventDefault(); }
                    if (u.hasClass('icon-opened', ev.target)) {
                        u.slideIn(this.el.querySelector('.bookmarks'));
                        this.list_model.save({'toggle-state': _converse.CLOSED});
                        ev.target.classList.remove("icon-opened");
                        ev.target.classList.add("icon-closed");
                    } else {
                        ev.target.classList.remove("icon-closed");
                        ev.target.classList.add("icon-opened");
                        u.slideOut(this.el.querySelector('.bookmarks'));
                        this.list_model.save({'toggle-state': _converse.OPENED});
                    }
                }
            });

            const initBookmarks = function () {
                if (!_converse.allow_bookmarks) {
                    return;
                }
                Promise.all([
                    _converse.api.disco.getIdentity('pubsub', 'pep', _converse.bare_jid),
                    _converse.api.disco.supports(Strophe.NS.PUBSUB+'#publish-options', _converse.bare_jid)
                ]).then((args) => {
                    const identity = args[0],
                          options_support = args[1];

                    if (_.isNil(identity) || !options_support.supported) {
                        _converse.emit('bookmarksInitialized');
                        return;
                    }
                    _converse.bookmarks = new _converse.Bookmarks();
                    _converse.bookmarks.fetchBookmarks().then(() => {
                        _converse.bookmarksview = new _converse.BookmarksView(
                            {'model': _converse.bookmarks}
                        );
                    }).catch(_.partial(_converse.log, _, Strophe.LogLevel.ERROR))
                      .then(() => {
                          _converse.emit('bookmarksInitialized');
                      });
                }).catch((e) => {
                    _converse.log(e, Strophe.LogLevel.ERROR);
                    _converse.emit('bookmarksInitialized');
                });
            };

            Promise.all([
                _converse.api.waitUntil('chatBoxesFetched'),
                _converse.api.waitUntil('roomsPanelRendered')
            ]).then(initBookmarks)
              .catch(_.partial(_converse.log, _, Strophe.LogLevel.FATAL));

            _converse.on('connected', () => {
                // Add a handler for bookmarks pushed from other connected clients
                // (from the same user obviously)
                _converse.connection.addHandler((message) => {
                    if (message.querySelector('event[xmlns="'+Strophe.NS.PUBSUB+'#event"]')) {
                        _converse.bookmarks.createBookmarksFromStanza(message);
                    }
                }, null, 'message', 'headline', null, _converse.bare_jid);
            });

            const afterReconnection = function () {
                if (!_converse.allow_bookmarks) {
                    return;
                }
                initBookmarks();
            };
            _converse.on('reconnected', afterReconnection);
        }