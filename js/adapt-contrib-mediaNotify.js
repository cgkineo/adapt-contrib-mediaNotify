/*
 * adapt-contrib-mediaNotify
 * License - http://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
 * Maintainers - Oliver Foster <oliver.foster@kineo.com>
 *
 */
define([
    'coreJS/adapt',
    "coreViews/notifyView",
    './mediaelement-and-player.min'
],function(Adapt, NotifyView, mep) {

    var OverriddenShowNotify = NotifyView.prototype.showNotify;
    var OverriddenCloseNotify = NotifyView.prototype.closeNotify;

    NotifyView.prototype.showNotify = function() {

        if (this.$("video, audio").length > 0) {
            return this.createPlayer();
        }

        if (this.$("img").length > 0) {
            return this.createImage();
        }

        OverriddenShowNotify.apply(this, arguments);
    };

    NotifyView.prototype.closeNotify = function() {
        if (this.$("video, audio").length > 0) {
            return this.removePlayer();
        }

        OverriddenCloseNotify.apply(this, arguments);
    };


    var NotifyMediaExtension = {

        createImage: function() {
            this.extractAndReplaceMedia();
            this.setReadyStatus();
        },

        createPlayer: function() {

            this.extractAndReplaceMedia();


            this.$(".medianotify-popup-content-inner-media").attr({
                "aria-label": Adapt.course.get("_globals")._components._media.ariaRegion,
                "role": "region"
            });

            this.$el.a11y_aria_label(true);

            this.setupMediaPlayerEvents();
            this.setupPlayer();

        },

        removePlayer: function() {
            this.onRemove();
            OverriddenCloseNotify.apply(this, arguments);
        },


        extractAndReplaceMedia: function() {
            var $mediaElements = this.$("video, audio, img").remove();

            $mediaElements.attr({
                "preload": "none",
                "width": "640px",
                "height": "360px",
                "style": "width:100%; height:100%;"
            });

            var $container = this.$(".notify-popup-content");
            var $buttons = $(".notify-popup-buttons", $container).remove();
            var $text = $(".notify-popup-content-inner", $container).remove();

            var $newContainer = $(Handlebars.templates['mediaNotify']());
            $(".medianotify-popup-content-inner-text", $newContainer).append($text.children());
            $(".medianotify-popup-content-inner-media", $newContainer).append($mediaElements);
            $(".medianotify-popup-buttons", $newContainer).replaceWith($buttons);

            $container.replaceWith($newContainer);

        },

        setupMediaPlayerEvents: function() {
            this.listenTo(Adapt, 'device:resize', this.onScreenSizeChanged);
            this.listenTo(Adapt, 'device:changed', this.onDeviceChanged);
            this.listenTo(Adapt, 'accessibility:toggle', this.onAccessibilityToggle);
        },

        setupPlayer: function() {
            if(!this.model.get('_playerOptions')) this.model.set('_playerOptions', {});

            var modelOptions = this.model.get('_playerOptions');

            if(modelOptions.pluginPath === undefined) modelOptions.pluginPath = 'assets/';
            if(modelOptions.features === undefined) modelOptions.features = ['playpause','progress','current','duration'];
            if(modelOptions.clickToPlayPause === undefined) modelOptions.clickToPlayPause = true;
            modelOptions.success = _.bind(this.onPlayerReady, this);

            var hasAccessibility = Adapt.config.get('_accessibility')._isEnabled;
            if (hasAccessibility) modelOptions.alwaysShowControls = true;

            // create the player
            this.$('audio, video').mediaelementplayer(modelOptions);
        },

        onDeviceChanged: function() {
            this.$('.medianotify-popup-content').removeClass("small medium large").addClass(Adapt.device.screenSize);
            this.$('.mejs-container').width(this.$('.component').width());
        },

        onScreenSizeChanged: function() {
            this.$('audio, video, img').width(this.$('.component').width());
        },

        onAccessibilityToggle: function() {
           this.showControls();
        },

        showControls: function() {
            var hasAccessibility = Adapt.config.get('_accessibility')._isEnabled;
            if (hasAccessibility) {
                if (!this.mediaElement.player) return;

                var player = this.mediaElement.player;

                player.options.alwaysShowControls = true;
                player.enableControls();
                player.showControls();

                this.$('.mejs-playpause-button button').attr({
                    "role": "button"
                });
                var screenReaderVideoTagFix = $("<div role='region' aria-label='.'>");
                this.$('.mejs-playpause-button').prepend(screenReaderVideoTagFix);

            }
        },

        onPlayerReady: function (mediaElement, domObject) {
            this.mediaElement = mediaElement;

            if (!this.mediaElement.player) {
                this.mediaElement.player =  mejs.players[$('.mejs-container').attr('id')];
            }

            this.showControls();

            var hasTouch = mejs.MediaFeatures.hasTouch;
            if(hasTouch) {
                this.setupPlayPauseToggle();
            }

            this.setReadyStatus();
        },

        setReadyStatus: function() {
            _.delay(_.bind(function() {
                this.onDeviceChanged();
                this.onScreenSizeChanged();
                OverriddenShowNotify.apply(this, arguments);
            }, this), 250);
        },

        setupPlayPauseToggle: function() {
            // bit sneaky, but we don't have a this.mediaElement.player ref on iOS devices
            var player = this.mediaElement.player;

            if(!player) {
                console.log("Media.setupPlayPauseToggle: OOPS! there's no player reference.");
                return;
            }

            // stop the player dealing with this, we'll do it ourselves
            player.options.clickToPlayPause = false;

            // play on 'big button' click
            $('.mejs-overlay-button',this.$el).click(_.bind(function(event) {
                player.play();
            }, this));

            // pause on player click
            $('.mejs-mediaelement',this.$el).click(_.bind(function(event) {
                var isPaused = player.media.paused;
                if(!isPaused) player.pause();
            }, this));
        },

        onRemove: function() {
            if ($("html").is(".ie8")) {
                var obj = this.$("object")[0];
                obj.style.display = "none"
            }
            $(this.mediaElement.pluginElement).remove();
            delete this.mediaElement;
        },

    };

    _.extend(NotifyView.prototype, NotifyMediaExtension);

    return NotifyView;

});
