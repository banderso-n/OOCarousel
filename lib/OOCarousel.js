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

        this.$list = this.$element.find('.' + OOCarousel.SELECTORS.LIST);

        this.clones = {
            $before: this.$list.clone().addClass(OOCarousel.SELECTORS.CLONE).prependTo(this.$element),
            $after:  this.$list.clone().addClass(OOCarousel.SELECTORS.CLONE).appendTo(this.$element)
        };

        this.currentItemIndex = 0;

        this._options = {
            fx:             OOCarousel.FX.SLIDE,
            autoAdvance:    false,
            pauseOnHover:   true,
            doRepeat:       true,
            speed:          800,
            delay:          7000,
            easing:        'ease'
        };

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


    var _style = $(document.createElement('style'))
            .append('.' + OOCarousel.SELECTORS.ITEM  + ' { display: inline-block; }')
            .append('.' + OOCarousel.SELECTORS.LIST  + ' { white-space: nowrap; font-size: 0; position: relative; }')
            .append('.' + OOCarousel.SELECTORS.CLONE + ' { position: absolute; top: 0; left: 0; width: 100%; }')
            .get(0);


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
        this.layout();
        return this;
    };


    OOCarousel.prototype.layout = function () {
        document.head.appendChild(_style);
        this.$element.css({ overflow: 'hidden', position: 'relative' });
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

        if (from === to) {
            return;
        }

        this.$element.trigger(OOCarousel.EVENTS.TRANSITION, [ this ]);
        this.currentItemIndex = to;
        return this._options.fx(this, from, to).then(this.$element.trigger.bind(this.$element, OOCarousel.EVENTS.TRANSITION_END, [ this ]));
    };


    OOCarousel.prototype.goTo = function (index) {
        return this.advance(index - this.currentItemIndex);
    };


    OOCarousel.prototype.getItems = function () {
        return this.$list.find('.' + OOCarousel.SELECTORS.ITEM);
    };


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
            if ((this._options.doRepeat === false && this.currentItemIndex >= this.getItems().length - 1) === false) {
                this.advance(1);
            }
        }
    };

    return OOCarousel;
});