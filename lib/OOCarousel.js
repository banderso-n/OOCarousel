(function (definition) {

    // RequireJS
    if (typeof define === 'function' && define.amd) {
        define(definition);

    // <script>
    } else {
        this.OOCarousel = definition(function () {});
    }

})(function (require) {
    'use strict';

    require('jquery');
    require('jquery-transit');

    /**
     * An object-oriented carousel class
     *
     * @constructor
     * @param {HTMLElement} element  The element to use as the carousel
     */
    function OOCarousel (element) {

        /**
         * The element to use as the carousel
         * @type {HTMLElement}
         */
        this.element = element;

        /**
         * The carousel element wrapped in jQuery
         * @type {jQuery}
         */
        this.$element = $(element);

        /**
         * The list that will contain the individual carousel items
         * @type {jQuery}
         */
        this.$list = this.$element.find('.' + OOCarousel.SELECTORS.LIST);

        /**
         * The carousel creates clones to make certain animations easier/possible
         * @type {jQuery{}}
         */
        this.clones = {
            $before: this.$list.clone().addClass(OOCarousel.SELECTORS.CLONE).prependTo(this.$element),
            $after:  this.$list.clone().addClass(OOCarousel.SELECTORS.CLONE).appendTo(this.$element)
        };

        /**
         * The index of the current item in the carousel
         * @type {Number}
         */
        this.currentItemIndex = 0;

        /**
         * A set of configurable options
         * @type {Object}
         */
        this._options = {
            fx:             OOCarousel.FX.SLIDE,
            autoAdvance:    false,
            pauseOnHover:   true,
            isCircular:     true,
            speed:          400,
            delay:          2000,
            easing:        'ease'
        };

        /**
         * The id of the timeout that auto-advances the carousel
         * @type {Number}
         */
        this._timeoutId = -1;

        this._onMouseEnter = this._onMouseEnter.bind(this);
        this._onMouseLeave = this._onMouseLeave.bind(this);
        this._autoAdvance = this._autoAdvance.bind(this);
    }


    OOCarousel.SELECTORS = {
        LIST:  'js-oocarousel-list',
        ITEM:  'js-oocarousel-item',
        CLONE: 'js-oocarousel-clone'
    };

    OOCarousel.EVENTS = {
        TRANSITION:     'oocarouselTransition',
        TRANSITION_END: 'oocarouselTransitionEnd',
    };

    OOCarousel.FX = {

        SLIDE: function (carousel, from, to) {
            var $items = carousel.getItems();
            var leftOrRight = from > 0 ? -1 : 1;
            var listLeft = carousel.$list.position().left;
            var itemsWidth = carousel.getItemsWidth();
            var itemLeft = $items.eq(to).position().left;
            var offset;

            if (Math.abs(from - to) === $items.length - 1) {
                leftOrRight = leftOrRight * -1;
                offset = ((listLeft + itemsWidth * leftOrRight) % itemsWidth);
                offset = offset === 0 ? itemsWidth * leftOrRight : offset;
                carousel.$list.stop().css({ left: offset });
                carousel.clones.$before.stop().css({ left: offset - itemsWidth });
                carousel.clones.$after.stop().css({ left: offset + itemsWidth });
            } else {
                carousel.clones.$before.stop().css({ left: listLeft - itemsWidth });
                carousel.clones.$after.stop().css({ left: itemsWidth + listLeft });
            }
            return $.when(
                carousel.clones.$before.animate({ left: itemLeft * -1 - itemsWidth  }, carousel._options.speed),
                carousel.clones.$after.animate({ left: itemsWidth - itemLeft }, carousel._options.speed),
                carousel.$list.stop().animate({ left: itemLeft * -1 }, carousel._options.speed)
            );
        },

        FADE:  function (carousel, from, to) {

        }
    };


    /**
     * Responsible for adding a few styles to the carousel and its items. OOCarousel uses a style sheet instead of inline styles so items can be more easily added to a carousel dynamically.
     * 
     * @type {HTMLStyleElement}
     * @private
     * @static
     */
    var _style = $(document.createElement('style'))
            .append('.' + OOCarousel.SELECTORS.ITEM  + ' { display: inline-block; }')
            .append('.' + OOCarousel.SELECTORS.LIST  + ' { white-space: nowrap; font-size: 0; position: relative; }')
            .append('.' + OOCarousel.SELECTORS.CLONE + ' { position: absolute; top: 0; left: 0; width: 100%; }')
            .get(0);


    /**
     * Set one or more OOCarousel._options
     * 
     * @param  {String} key    The key in OOCarousel._options
     * @param  {*}      value  The new value
     * @return {OOCarousel}
     */
    /**
     * @param  {Object} options  An object of property-value pairs to set in OOCarousel._options
     * @return {OOCarousel}
     */
    OOCarousel.prototype.set = function (key, value) {
        if (arguments[0] instanceof Object) {
            var options = arguments[0];
            var option;
            for (option in options) {
                this.set(option, options[option]);
            }
        } else {
            if (this._options.hasOwnProperty(key)) {
                this._options[key] = value;
            }
        }
        return this;
    };


    /**
     * Start the carousel once it's constructed
     * 
     * @return {OOCarousel}
     */
    OOCarousel.prototype.start = function () {
        this._timeoutId = window.setTimeout(this._autoAdvance, this._options.delay);
        this.$element.on('mouseenter', this._onMouseEnter);
        this.$element.on('mouseleave', this._onMouseLeave);
        this.layout();
        return this;
    };


    /**
     * Apply necessary styles to get the carousel to lay out correctly
     * 
     * @return {OOCarousel}
     */
    OOCarousel.prototype.layout = function () {
        document.head.appendChild(_style);
        this.$element.css({ overflow: 'hidden', position: 'relative' });
        return this;
    };


    /**
     * Revert the carousel back to its uninstantiated state
     * 
     * @return {OOCarousel}
     */
    OOCarousel.prototype.stop = function () {
        this.$element.off('mouseenter', this._onMouseEnter);
        this.$element.off('mouseleave', this._onMouseLeave);
        return this;
    };


    /**
     * Advance the carousel a specific number of slides. If the `isCircular` is set to `true`, the number will loop around and continue from 0.
     * 
     * @param  {Number} howMany  Increments the carousel this many slides
     * @return {$.Deferred}      A promise that gets resolved when the transition animation completes
     */
    OOCarousel.prototype.advance = function (howMany) {
        var $items = this.getItems();
        var from = this.currentItemIndex;
        var to = this.currentItemIndex + howMany;
        var max = $items.length - 1;
        var min = 0;
        if (this._options.isCircular) {
            to = to % $items.length;
            if (to < 0) {
                to = to + $items.length;
            }
        } else {
            if (to > max) {
                to = max;
            } else if (to < min) {
                to = min;
            }
        }

        window.clearTimeout(this._timeoutId);
        this._timeoutId = window.setTimeout(this._autoAdvance, this._options.delay);

        if (from === to) {
            return $.when();
        }

        this.$element.trigger(OOCarousel.EVENTS.TRANSITION, [ this ]);
        this.currentItemIndex = to;
        return this._options.fx(this, from, to).then(this.$element.trigger.bind(this.$element, OOCarousel.EVENTS.TRANSITION_END, [ this ]));
    };


    /**
     * Go to a specific slide by its index
     * 
     * @param  {Number} index  The index of the slide you want to go to
     * @return {OOCarousel}
     */
    OOCarousel.prototype.goTo = function (index) {
        return this.advance(index - this.currentItemIndex);
    };


    /**
     * Returns a jQuery collection of elements that have been specified as carousel items with a class of OOCarousel.SELECTORS.ITEM
     * 
     * @return {jQuery}
     */
    OOCarousel.prototype.getItems = function () {
        return this.$list.find('.' + OOCarousel.SELECTORS.ITEM);
    };


    /**
     * Returns the total width of all the items in the carousel
     * 
     * @return {Number}
     */
    OOCarousel.prototype.getItemsWidth = function () {
        var width = 0;
        this.getItems().each(function (i, element) {
            width = width + $(element).width();
        });
        return width;
    };


    OOCarousel.prototype._onMouseEnter = function () {
        if (this._options.pauseOnHover) {
            clearTimeout(this._timeoutId);
        }
    };


    OOCarousel.prototype._onMouseLeave = function () {
        if (this._options.pauseOnHover && this._options.autoAdvance) {
            this._timeoutId = window.setTimeout(this._autoAdvance, this._options.delay);
        }
    };


    OOCarousel.prototype._autoAdvance = function () {
        if (this._options.autoAdvance) {
            this.advance(1);
        }
    };

    return OOCarousel;
});