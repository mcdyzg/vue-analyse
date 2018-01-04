/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _vue = __webpack_require__(1);

	var _vue2 = _interopRequireDefault(_vue);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var v = new _vue2.default({
	  data: {
	    a: 'a',
	    b: {
	      c: 'c'
	    }
	  }
	}); // import Observer from './observer'


	v.$watch("a", function () {
	  console.log("a被改变");
	}); // 此处如果用箭头函数，this指向undefined
	v.$watch("b", function () {
	  return console.log("b被改变");
	});

	setTimeout(function () {
	  v.a = 4;
	  // 此处改变b.c的值，但是我们的监听只监听了b属性，b依然指向原来那个对象，所以b的监听不会被触发，但是当前watch方法是无法监听到b.c的
	  v.b.c = 5;
	}, 1000);

	setTimeout(function () {
	  v.a = 5;
	}, 2000);

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _watcher = __webpack_require__(2);

	var _watcher2 = _interopRequireDefault(_watcher);

	var _observer = __webpack_require__(4);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Vue = function () {
	  function Vue() {
	    var _this = this;

	    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    _classCallCheck(this, Vue);

	    //这里简化了。。其实要merge
	    this.$options = options;
	    //这里简化了。。其实要区分的
	    // 把data备份给this._data属性
	    var data = this._data = this.$options.data;
	    Object.keys(data).forEach(function (key) {
	      return _this._proxy(key);
	    });
	    data.a = 'a';
	    // 这里的data保存着this.$options.data对象的指针
	    console.log(this._data.a);
	    (0, _observer.observe)(data, this);
	  }

	  _createClass(Vue, [{
	    key: '$watch',
	    value: function $watch(expOrFn, cb, options) {
	      // expOrFn要观察的属性名
	      new _watcher2.default(this, expOrFn, cb);
	    }
	  }, {
	    key: '_proxy',
	    value: function _proxy(key) {

	      var self = this;
	      Object.defineProperty(self, key, {
	        configurable: true,
	        enumerable: true,
	        get: function proxyGetter() {
	          return self._data[key];
	        },
	        set: function proxySetter(val) {
	          self._data[key] = val;
	        }
	      });
	    }
	  }]);

	  return Vue;
	}();

	exports.default = Vue;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _dep = __webpack_require__(3);

	var _dep2 = _interopRequireDefault(_dep);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Watcher = function () {
	  function Watcher(vm, expOrFn, cb) {
	    _classCallCheck(this, Watcher);

	    this.cb = cb;
	    this.vm = vm;
	    //此处简化
	    this.expOrFn = expOrFn;
	    this.value = this.get();
	  }

	  _createClass(Watcher, [{
	    key: 'update',
	    value: function update() {
	      this.run();
	    }
	  }, {
	    key: 'run',
	    value: function run() {
	      var value = this.get();
	      if (value !== this.value) {
	        this.value = value;
	        this.cb.call(this.vm);
	      }
	    }
	  }, {
	    key: 'addDep',
	    value: function addDep(dep) {
	      dep.addSub(this);
	    }
	  }, {
	    key: 'beforeGet',
	    value: function beforeGet() {}
	  }, {
	    key: 'afterGet',
	    value: function afterGet() {}
	  }, {
	    key: 'get',
	    value: function get() {
	      _dep2.default.target = this;
	      //此处简化。。要区分fuction还是expression。
	      // 这句是最重要的，此处取值会触发this.vm._data[this.expOrFn]的get方法,从而将此watch实例添加到了this.vm._data[this.expOrFn]的dep属性的subs里
	      var value = this.vm._data[this.expOrFn];
	      _dep2.default.target = null;
	      return value;
	    }
	  }]);

	  return Watcher;
	}();

	exports.default = Watcher;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var uid = 0;

	/**
	 * A dep is an observable that can have multiple
	 * directives subscribing to it.
	 *
	 * @constructor
	 */

	var Dep = function () {
	  function Dep() {
	    _classCallCheck(this, Dep);

	    this.id = uid++;
	    this.subs = [];
	  }

	  _createClass(Dep, [{
	    key: 'addSub',
	    value: function addSub(sub) {
	      this.subs.push(sub);
	    }
	  }, {
	    key: 'notify',
	    value: function notify() {
	      console.log('dep被触发');
	      this.subs.forEach(function (sub) {
	        return sub.update();
	      });
	    }
	  }]);

	  return Dep;
	}();

	//Dep.target  的是watcher


	exports.default = Dep;
	Dep.target = null;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	exports.defineReactive = defineReactive;
	exports.observe = observe;

	var _util = __webpack_require__(5);

	var _dep = __webpack_require__(3);

	var _dep2 = _interopRequireDefault(_dep);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Observer = function () {
	  function Observer(value) {
	    _classCallCheck(this, Observer);

	    this.value = value;
	    this.dep = new _dep2.default();
	    this.walk(value);
	  }
	  //递归。。让每个字属性可以observe


	  _createClass(Observer, [{
	    key: "walk",
	    value: function walk(value) {
	      var _this = this;

	      Object.keys(value).forEach(function (key) {
	        return _this.convert(key, value[key]);
	      });
	    }
	  }, {
	    key: "convert",
	    value: function convert(key, val) {
	      defineReactive(this.value, key, val);
	    }
	  }]);

	  return Observer;
	}();

	exports.default = Observer;
	function defineReactive(obj, key, val) {
	  // 每个属性都对应一个dep实例
	  var dep = new _dep2.default();
	  var childOb = observe(val);

	  Object.defineProperty(obj, key, {
	    enumerable: true,
	    configurable: true,
	    get: function get() {
	      // 说明这是watch 引起的
	      if (_dep2.default.target) {
	        dep.addSub(_dep2.default.target);
	      }
	      return val;
	    },
	    set: function set(newVal) {
	      var value = val;
	      if (newVal === value) {
	        return;
	      }
	      val = newVal;
	      childOb = observe(newVal);
	      // 只要值改变，属性的dep.notify就会被触发,即便是dep的sub数组里没有监听函数
	      dep.notify();
	    }
	  });
	}

	function observe(value, vm) {
	  if (!value || (typeof value === "undefined" ? "undefined" : _typeof(value)) !== 'object') {
	    return;
	  }
	  return new Observer(value);
	}

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.mixin = mixin;
	exports.isObject = isObject;
	exports.isArray = isArray;
	exports.augment = augment;
	exports.define = __webpack_require__(6);
	exports.def = def;
	/**
	 * Mix properties into target object.
	 *
	 * @param {Object} target
	 * @param {Object} mixin
	 */

	function mixin(target, mixin) {
	  for (var key in mixin) {
	    if (target[key] !== mixin[key]) {
	      target[key] = mixin[key];
	    }
	  }
	}

	/**
	 * Object type check. Only returns true
	 * for plain JavaScript objects.
	 *
	 * @param {*} obj
	 * @return {Boolean}
	 */

	function isObject(obj) {
	  return Object.prototype.toString.call(obj) === '[object Object]';
	}

	/**
	 * Array type check.
	 *
	 * @param {*} obj
	 * @return {Boolean}
	 */

	function isArray(obj) {
	  return Array.isArray(obj);
	}
	function augment(target, proto) {
	  target.__proto__ = proto;
	}
	//使 属性不能枚举，不能 Object.keys() 找到
	function define(obj, key, val) {
	  Object.defineProperty(obj, key, {
	    value: val,
	    enumerable: false,
	    writable: true,
	    configurable: true
	  });
	}

	function def(obj, key, val, enumerable) {
	  Object.defineProperty(obj, key, {
	    value: val,
	    enumerable: !!enumerable,
	    writable: true,
	    configurable: true
	  });
	}

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	module.exports = function() { throw new Error("define cannot be used indirect"); };


/***/ })
/******/ ]);