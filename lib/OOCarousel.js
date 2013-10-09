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

    function OOCarousel (element) {

        this.element = element;

        this.$element = $(element);

        this.currentItemIndex = 0;

        this._layout = '';

        this._options = {
            fx:             OOCarousel.FX.SLIDE,
            autoAdvance:    false,
            pauseOnHover:   true,
            doRepeat:       true,
            speed:          800,
            delay:          7000,
            easing:         'ease'
        };

        this._timeoutId = -1;

        this._onMouseEnter = this._onMouseEnter.bind(this);
        this._onMouseLeave = this._onMouseLeave.bind(this);
        this._autoAdvance = this._autoAdvance.bind(this);

    }

    OOCarousel.SELECTORS = {
        CONTAINER:  'js-oocarousel-container',
        ITEM:       'js-oocarousel-item'
    };

    OOCarousel.FX = {

        SLIDE: function (carousel, from, to) {

            var carouselWidth = carousel.$element.width();
            var carouselHeight = carousel.$element.height();
            var $items = carousel.getItems();

            if (carousel._layout !== 'slide') {
                carousel._layout = 'slide';
                carousel.$element.css({ position: 'relative' });
                $items.each(function (i, element) {
                    $(element).css({ position: 'absolute', top: 0, left: i * 100 + '%' });
                });
            }

            $items.each(function (i, element) {
                $(element).transition({ translate: [ to * -100 + '%', 0 ] }, carousel._options.speed, carousel._options.easing);
            });
        },

        FADE:  function (carousel, from, to) {

            var $items = carousel.getItems();
            var $to = $items.eq(to);
            var $from = $items.eq(from);
            var zIndex = to < from ? $items.length - to : 1; // If we're moving backwards, make sure the `to` slide has a higher zIndex than any others that might be still animating

            if (carousel._layout !== 'fade') {
                carousel._layout = 'fade';
                carousel.$element.css({ position: 'relative' });
                $items.css({
                    opacity: 0,
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    zIndex: 0
                });
                $from.css({ opacity: 1 });
            }

            $to.css({ zIndex: zIndex }).transition({ opacity: 1 }, carousel._options.speed, carousel._options.easing, function () {
                $to.css({ zIndex: 0 });
                $from.css({ opacity: 0 });
            });
        }
    };

    /**
     * Set a value in options by its key
     * 
     * @param  {String} key    The key in OOCarousel._options
     * @param  {*}      value  The new value
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

    OOCarousel.prototype.start = function () {
        this._timeoutId = window.setTimeout(this._autoAdvance, this._options.delay);
        this.$element.on('mouseenter', this._onMouseEnter);
        this.$element.on('mouseleave', this._onMouseLeave);
        return this;
    };

    OOCarousel.prototype.stop = function () {
        this.$element.off('mouseenter', this._onMouseEnter);
        this.$element.off('mouseleave', this._onMouseLeave);
        return this;
    };

    OOCarousel.prototype.advance = function (howMany) {
        var $items = this.getItems();
        var from = this.currentItemIndex;
        var to = (this.currentItemIndex + howMany) % $items.length;
        if (to < 0) {
            to = to + $items.length;
        }

        window.clearTimeout(this._timeoutId);
        this._timeoutId = window.setTimeout(this._autoAdvance, this._options.delay);

        this.currentItemIndex = to;
        return this._options.fx(this, from, to);
    };

    OOCarousel.prototype.goTo = function (index) {
        return this.advance(index - this.currentItemIndex);
    };

    OOCarousel.prototype.getItems = function () {
        return this.$element.find('.' + OOCarousel.SELECTORS.ITEM);
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
            if ((this._options.doRepeat === false && this.currentItemIndex >= this.getItems().length - 1) === false) {
                this.advance(1);
            }
        }
    };

    return OOCarousel;
});