# blear.ui.slider

[![npm module][npm-img]][npm-url]
[![build status][travis-img]][travis-url]
[![coverage][coveralls-img]][coveralls-url]

[travis-img]: https://img.shields.io/travis/blearjs/blear.ui.slider/master.svg?maxAge=2592000&style=flat-square
[travis-url]: https://travis-ci.org/blearjs/blear.ui.slider

[npm-img]: https://img.shields.io/npm/v/blear.ui.slider.svg?maxAge=2592000&style=flat-square
[npm-url]: https://www.npmjs.com/package/blear.ui.slider

[coveralls-img]: https://img.shields.io/coveralls/blearjs/blear.ui.slider/master.svg?maxAge=2592000&style=flat-square
[coveralls-url]: https://coveralls.io/github/blearjs/blear.ui.slider?branch=master




## 约束的 DOM 结构
父子结构，多个并列子元素（只约束结构）
```
<div class="slider" id="slider">
    <div class="slider-items">
        <div class="slider-item"></div>
        <div class="slider-item"></div>
        ...
    </div>
</div>

new Slider({el: '#slider'});
```


