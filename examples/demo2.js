/**
 * 文件描述
 * @author ydr.me
 * @create 2018-05-21 16:37
 * @update 2018-05-21 16:37
 */


'use strict';

var Slider = require('../src/index');
var Animation = require('blear.classes.animation');

var s1 = new Slider({
    el: '#demo2',
    width: window.innerWidth,
    height: window.innerHeight,
    loop: false,
    auto: false,
    spring: false,
    direction: 'y',
    slideAnimation: function (el, to, done) {
        var an = new Animation(el);

        an.transit(to);
        an.start(done);
        an.destroy();
    }
});

document.getElementById('btn1').onclick = function () {
    alert('btn1');
};
