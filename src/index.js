/**
 * Slider
 * @author ydr.me
 * @create 2016-05-11 18:08
 */


'use strict';

var UI = require('blear.ui');
var object = require('blear.utils.object');
var array = require('blear.utils.array');
var time = require('blear.utils.time');
var Touchable = require('blear.classes.touchable');
var selector = require('blear.core.selector');
var attribute = require('blear.core.attribute');
var layout = require('blear.core.layout');
var modification = require('blear.core.modification');

var namespace = UI.UI_CLASS + '-slider';
var gid = 0;
var defaults = {
    el: '',
    width: 'auto',
    height: 'auto',
    direction: 'x',
    addClass: '',
    loop: true,
    auto: true,
    interval: 5000,
    minChangeLength: 50,
    slideAnimation: function (el, to, done) {
        attribute.style(el, to);
        done();
    }
};
var Slider = UI.extend({
    className: 'Slider',
    constructor: function (options) {
        var the = this;

        the[_options] = object.assign(true, {}, defaults, options);
        Slider.parent(the, the[_options]);
        the[_sliderEl] = selector.query(options.el)[0];
        the[_sliderItemsEl] = selector.children(the[_sliderEl])[0];
        the[_visibleIndex] = 0;
        the[_processing] = false;
        the[_initEvent]();
        the.update();
        time.nextTick(function () {
            the.emit('beforeSlide', the[_visibleIndex]);
            the.emit('afterSlide', the[_visibleIndex]);
        });
    },


    /**
     * 更新视图
     * @returns {Slider}
     */
    update: function () {
        var the = this;
        var options = the[_options];
        var els = the[_sliderItemEls] = selector.children(the[_sliderItemsEl]);
        var vertical = options.direction !== 'x';

        the[_pauseAutoPlay]();
        the.length = els.length;

        the.emit('beforeUpdate');
        array.each(els, function (index, el) {
            attribute.style(el, {
                width: options.width,
                height: options.height,
                float: 'left',
                padding: 0,
                margin: 0
            });
            the.emit('update', index, the.length);
        });

        if (!the.length) {
            the.emit('afterUpdate');
            return the;
        }

        the[_itemWidth] = layout.outerWidth(els[0]);
        the[_itemHeight] = layout.outerHeight(els[0]);

        if (the[_sliderItemFirstEl]) {
            the.length -= 2;
            modification.remove(the[_sliderItemFirstEl]);
            modification.remove(the[_sliderItemLastEl]);
        }

        var addLength = 0;

        if (options.loop && the.length > 1) {
            the[_loopable] = true;
            the[_sliderItemFirstEl] = els[0].cloneNode(true);
            the[_sliderItemLastEl] = els[the.length - 1].cloneNode(true);

            var cloneClass = namespace + '-clone';

            attribute.addClass(the[_sliderItemFirstEl], cloneClass);
            attribute.addClass(the[_sliderItemLastEl], cloneClass);

            modification.insert(the[_sliderItemFirstEl], the[_sliderItemsEl], 'beforeend');
            modification.insert(the[_sliderItemLastEl], the[_sliderItemsEl], 'afterbegin');

            addLength = 2;
        } else {
            the[_loopable] = false;
        }

        var sliderWidth = vertical ? the[_itemWidth] : the[_itemWidth] * (the.length + addLength);
        var sliderHeight = vertical ? the[_itemHeight] * (the.length + addLength) : the[_itemHeight];

        attribute.style(the[_sliderItemsEl], {
            width: sliderWidth,
            height: sliderHeight,
            padding: 0,
            margin: 0
        });

        attribute.style(the[_sliderEl], {
            overflow: 'hidden',
            width: the[_itemWidth],
            height: the[_itemHeight]
        });

        the[_originalIndex] = the[_visibleIndex] + (the[_loopable] ? 1 : 0);
        var translate = the[_calTranslate]();
        the[_setTransform](translate);
        the[_startAutoPlay]();
        the.emit('afterUpdate');

        return the;
    },


    /**
     * 上一张
     * @returns {Slider}
     */
    prev: function () {
        var the = this;

        the[_pauseAutoPlay]();
        the[_processStepPlay](-1, function () {
            the[_startAutoPlay]();
        });

        return the;
    },


    /**
     * 下一张
     * @returns {Slider}
     */
    next: function () {
        var the = this;

        the[_pauseAutoPlay]();
        the[_processStepPlay](1, function () {
            the[_startAutoPlay]();
        });

        return the;
    },


    /**
     * 跳转到第几张
     * @param index
     * @returns {Slider}
     */
    go: function (index) {
        var the = this;

        if (the[_processing]) {
            return the;
        }

        var visibleIndex = the[_visibleIndex];

        index = index % the.length;
        // 选取最近的方向
        var step = index - visibleIndex;

        the[_processStepPlay](step);

        return the;
    },


    /**
     * 当前视图索引值
     * @returns {*}
     */
    index: function () {
        return this[_visibleIndex];
    },


    /**
     * 监听 tap
     * @param sel {String} 选择器
     * @param handle {Function} 处理函数
     * @returns {Slider}
     */
    tap: function (sel, handle) {
        var the = this;

        the.on('tap', function (meta) {
            var ev = meta.originalEvent;
            var targetEl = ev.target;
            var closestEl = selector.closest(targetEl, sel, the[_sliderEl])[0];

            if (closestEl) {
                handle.call(closestEl, ev);
            }
        });

        return the;
    },


    /**
     * 销毁实例
     */
    destroy: function () {
        var the = this;

        if (the[_sliderItemFirstEl]) {
            modification.remove(the[_sliderItemFirstEl]);
        }

        if (the[_sliderItemLastEl]) {
            modification.remove(the[_sliderItemLastEl]);
        }

        the[_setTransform](0);
        the[_touchable].destroy();
        the[_pauseAutoPlay]();
        the[_destroyed] = true;
    }
});
var _options = Slider.sole();
var _loopable = Slider.sole();
var _sliderEl = Slider.sole();
var _sliderItemsEl = Slider.sole();
var _sliderItemEls = Slider.sole();
var _sliderItemFirstEl = Slider.sole();
var _sliderItemLastEl = Slider.sole();
var _itemWidth = Slider.sole();
var _itemHeight = Slider.sole();
var _visibleIndex = Slider.sole();
var _originalIndex = Slider.sole();
var _calTranslate = Slider.sole();
var _getTranslate3dStyle = Slider.sole();
var _translate = Slider.sole();
var _setTransform = Slider.sole();
var _beforeTransform = Slider.sole();
var _processing = Slider.sole();
var _processStepPlay = Slider.sole();
var _pauseAutoPlay = Slider.sole();
var _startAutoPlay = Slider.sole();
var _autoTimer = Slider.sole();
var _initEvent = Slider.sole();
var _touchable = Slider.sole();
var _reset = Slider.sole();
var _destroyed = Slider.sole();
var pro = Slider.prototype;


/**
 * 计算偏移量
 */
pro[_calTranslate] = function () {
    var the = this;

    if (the[_options].direction === 'x') {
        return (the[_translate] = -the[_itemWidth] * the[_originalIndex]);
    } else {
        return (the[_translate] = -the[_itemWidth] * the[_originalIndex]);
    }
};


/**
 * 计算偏移量
 * @param translate
 */
pro[_getTranslate3dStyle] = function (translate) {
    var the = this;
    var translate3d = 'translate3d(';

    if (the[_options].direction === 'x') {
        translate3d += translate + 'px, 0, 0';
    } else {
        translate3d += '0, ' + translate + 'px, 0';
    }

    translate3d += ')';

    return translate3d;
};


/**
 * 设置变换
 */
pro[_setTransform] = function (translate) {
    var the = this;
    var transform = the[_getTranslate3dStyle](translate);
    attribute.style(the[_sliderItemsEl], 'transform', transform);
};


/**
 * 变换之前
 * @param step
 * @param next
 */
pro[_beforeTransform] = function (step, next) {
    var the = this;
    var options = the[_options];

    step = step % the.length;

    if (!step) {
        return the;
    }

    var nowVisibleIndex = the[_visibleIndex];
    the[_visibleIndex] += step;
    the[_processing] = true;

    if (the[_loopable]) {
        var translate = '';
        var nowTranslate = the[_translate];
        var willTranslate = the[_calTranslate]();
        var offsetTranslate = willTranslate - nowTranslate;

        // prev
        if (step < 0) {
            if (the[_visibleIndex] < 0) {
                the[_visibleIndex] = the.length + the[_visibleIndex];
                the[_originalIndex] = the.length + 1;
                translate = the[_calTranslate]();
                the[_setTransform](translate - offsetTranslate);
            }

            the[_originalIndex] = the[_visibleIndex] + 1;
        }
        // next
        else {
            if (the[_visibleIndex] >= the.length) {
                the[_visibleIndex] = the[_visibleIndex] - the.length;
                the[_originalIndex] = the[_visibleIndex];
                translate = the[_calTranslate]();
                the[_setTransform](translate - offsetTranslate);
            }

            the[_originalIndex] = the[_visibleIndex] + 1;
        }
    } else {
        if (the[_visibleIndex] < 0) {
            the[_visibleIndex] = 0;
        } else if (the[_visibleIndex] >= the.length) {
            the[_visibleIndex] = the.length - 1;
        }

        the[_originalIndex] = the[_visibleIndex];
    }

    time.nextFrame(function () {
        next(nowVisibleIndex !== the[_visibleIndex]);
    });
};


/**
 * 步进播放
 * @param step
 * @param callback
 */
pro[_processStepPlay] = function (step, callback) {
    var the = this;

    the[_beforeTransform](step, function (can) {
        if (!can) {
            the[_processing] = false;
            the[_reset]();
            return;
        }

        var translate = the[_calTranslate]();
        var to = {
            transform: the[_getTranslate3dStyle](translate)
        };

        the.emit('beforeSlide', the[_visibleIndex], to);
        the[_options].slideAnimation.call(the, the[_sliderItemsEl], to, function () {
            the[_processing] = false;

            if (callback) {
                callback();
            }

            the.emit('afterSlide', the[_visibleIndex]);
        });
    });
};


/**
 * 重置当前位置
 */
pro[_reset] = function () {
    var the = this;
    var nowTranslate = the[_translate];
    var willTranslate = the[_calTranslate]();
    var offsetTranslate = willTranslate - nowTranslate;
    var to = {
        transform: the[_getTranslate3dStyle](willTranslate)
    };

    if (Math.abs(offsetTranslate) > 0) {
        the[_processing] = true;
        the[_options].slideAnimation.call(the, the[_sliderItemsEl], to, function () {
            the[_processing] = false;
        });
    }
};


/**
 * 暂停播放
 */
pro[_pauseAutoPlay] = function () {
    var the = this;
    var options = the[_options];

    if (!options.auto) {
        return;
    }

    clearInterval(the[_autoTimer]);
};


/**
 * 自动播放
 */
pro[_startAutoPlay] = function () {
    var the = this;
    var options = the[_options];

    if (!options.auto || the[_destroyed]) {
        return;
    }

    the[_pauseAutoPlay]();

    the[_autoTimer] = setInterval(function () {
        the[_processStepPlay](1);
    }, options.interval);
};


pro[_initEvent] = function () {
    var the = this;
    var options = the[_options];
    var touchable = false;
    var touchStartTranslate = 0;
    var horizontal = options.direction === 'x';

    the[_touchable] = new Touchable({
        el: the[_sliderEl],
        swipeMinDistance: options.minChangeLength
    });

    the[_touchable].on('touchStart', function () {
        the[_pauseAutoPlay]();

        if (the[_processing]) {
            return;
        }

        touchable = true;
        touchStartTranslate = the[_calTranslate]();
    });

    the[_touchable].on('touchMove', function (meta) {
        if (touchable) {
            var delta = horizontal ? meta.deltaX : meta.deltaY;
            the[_translate] = touchStartTranslate + delta;
            the[_setTransform](the[_translate]);
        }
    });

    the[_touchable].on('touchEnd', function () {
        if (touchable) {
            touchable = false;
            var delta = the[_translate] - touchStartTranslate;
            var canChange = the.length > 1 && Math.abs(delta) > options.minChangeLength;

            if (!canChange) {
                the[_reset]();
            }
        }

        the[_startAutoPlay]();
    });


    if (options.direction === 'x') {
        the[_touchable].on('swipeLeft', function () {
            the.next();
        });
        the[_touchable].on('swipeRight', function () {
            the.prev();
        });
    } else {
        the[_touchable].on('swipeUp', function () {
            the.next();
        });
        the[_touchable].on('swipeDown', function () {
            the.prev();
        });
    }

    // touch 会影响 fastclick
    the[_touchable].on('tap', function (meta) {
        the.emit('tap', meta);
    });
};


Slider.defaults = defaults;
module.exports = Slider;
