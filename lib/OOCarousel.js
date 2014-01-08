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

        this._onMouseEnter = _onMouseEnter.bind(this);
        this._onMouseLeave = _onMouseLeave.bind(this);
        this._autoAdvance = _autoAdvance.bind(this);
    }


    OOCarousel.SELECTORS = {
        LIST:  'oocarousel-list',
        ITEM:  'oocarousel-item'
    };

    OOCarousel.EVENTS = {
        TRANSITION:     'oocarouselTransition',
        TRANSITION_END: 'oocarouselTransitionEnd',
    };

    OOCarousel.FX = {

        SLIDE: function (carousel, from, to) {
            var $items = carousel.getItems();
            var itemLeft = $items.eq(to).position().left;
            var leftOrRight;

            if (Math.abs(from - to) === $items.length - 1) {
                leftOrRight = from > 0 ? 1 : -1;
            }

            return $.when(carousel.$list.stop().transition({ x: to * -100 + '%' }, carousel._options.speed));
        },

        FADE: function (carousel, from, to) {
            var $items = carousel.getItems();
            var $from = $items.eq(from).stop();
            var $to = $items.eq(to).stop();
            $from.css({ zIndex: 0 });
            $to.css({ zIndex: 1 });
            return $.when($to.transition({ opacity: 1 }, carousel._options.speed)).then(function () {
                $from.css({ opacity: 0 });
            });
        }
    };


    var _onMouseEnter = function () {
        if (this._options.pauseOnHover) {
            clearTimeout(this._timeoutId);
        }
    };


    var _onMouseLeave = function () {
        if (this._options.pauseOnHover && this._options.autoAdvance) {
            this._timeoutId = window.setTimeout(this._autoAdvance, this._options.delay);
        }
    };


    var _autoAdvance = function () {
        if (this._options.autoAdvance) {
            this.advance(1);
        }
    };


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
        return this;
    };


    /**
     * Revert the carousel back to its uninstantiated state
     * 
     * @return {OOCarousel}
     */
    OOCarousel.prototype.stop = function () {
        clearTimeout(this._timeoutId);
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


    return OOCarousel;
});