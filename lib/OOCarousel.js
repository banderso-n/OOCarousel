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

        this.currentSlideIndex = 0;

        this._layout = '';

        this._options = {
            fx:             OOCarousel.FX.SLIDE,
            pauseOnHover:   true,
            doRepeat:       true,
            speed:          600,
            easing:         'snap'
        };

    }

    OOCarousel.SELECTORS = {
        CONTAINER:  'js-oocarousel-container',
        ITEM:       'js-oocarousel-item'
    };

    OOCarousel.FX = {

        SLIDE: function (carousel, from, to) {

            var carouselWidth = carousel.$element.width();
            var carouselHeight = carousel.$element.height();
            var $items = carousel.$element.find('.' + OOCarousel.SELECTORS.ITEM).stop();

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

            var $items = carousel.$element.find('.' + OOCarousel.SELECTORS.ITEM).stop();
            var $to = $items.eq(to);
            var $from = $items.eq(from);

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

            $to.css({ zIndex: 1 }).transition({ opacity: 1 }, carousel._options.speed, carousel._options.easing, function () {
                console.log('done');
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

        return this;
    };

    OOCarousel.prototype.advance = function (howMany) {
        var $items = this.$element.find('.' + OOCarousel.SELECTORS.ITEM);
        var from = this.currentSlideIndex;
        var to = (this.currentSlideIndex + howMany) % $items.length;
        if (to < 0) {
            to = to + $items.length;
        }

        this.currentSlideIndex = to;
        this._options.fx(this, from, to);
    };

    OOCarousel.Transition = (function () {

        function OOCarouselTransition () {

        }

        OOCarousel.prototype.layout = function (carousel) {

        };

        OOCarousel.prototype.transition = function (carousel, from, to) {

        };

        return OOCarouselTransition;
    })();

    return OOCarousel;
});