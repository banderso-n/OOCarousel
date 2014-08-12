(function (definition) {

    // RequireJS
    if (typeof define === 'function' && define.amd) {
        define(definition);

    // <script>
    } else {
        this.OOSlider = definition(function () {});
    }

})(function (require) {
    'use strict';

    require('jquery');
    require('jquery-transit');


    function OOSlider (element) {

        this.element = element;

        this.$element = $(element);

        this.init();
    }


    OOSlider.prototype.init = function () {

    };


    return OOSlider;
});