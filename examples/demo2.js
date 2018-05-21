/**
 * 文件描述
 * @author ydr.me
 * @create 2018-05-21 16:37
 * @update 2018-05-21 16:37
 */


'use strict';

var Slider = require('../src/index');

new Slider({
    el: '#demo2',
    width: 500,
    height: 300,
    loop: false,
    auto: false,
    direction: 'y'
});

document.getElementById('btn1').onclick = function () {
    alert('btn1');
};
