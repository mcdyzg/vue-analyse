
不管读再多的文档，感觉还是自己写(抄)一遍记得牢。。

## 实现目标

```
    var demo = new Vue({
        el: '#demo',
        data: {
            text: "before change text",
            text2: "before change text2",
        },
        render() {
            return this.__h__('div', {}, [
                this.__h__('span', {}, [this.__toString__(this.text)]),
                this.__h__('span', {}, [this.__toString__(this.text2)])
            ])
        }
    })

    setTimeout(function() {
        demo.text = "after change text"
        demo.text2 = "after change text2"
    }, 2000)

    setTimeout(function() {
        demo.text = "after after change text"
        demo.text2 = "after after change text2"
    }, 3000)
```

先实现一个小目标，text和text2能在页面上呈现出来，在实现一个大点的，2秒后和3秒后页面中的文本改变。

## 模拟一个Vue的构造函数

底板先摆出来：

    class Vue {
        constructor(options) {
            先将传入的data参数放到实例的_data属性上以供调用
            this._data = options.data
        }
    }

下面要干的第一步是将new Vue实例时传入的参数处理下。怎么个处理法？例如：我们的text和text2属性是放到_data这个属性上的，那么调用的时候可能就要写demo._data.text。这样写太复杂，不如demo.text方便。

    constructor(options) {
        this.$options = options
        this._data = options.data
        Object.keys(options.data).forEach(key => this._proxy(key))
    }

    _proxy(key) {
        const self = this
        Object.defineProperty(self, key, {
            configurable: true,
            enumerable: true,
            get: function proxyGetter() {
                return self._data[key]
            },
            set: function proxySetter(val) {
                self._data[key] = val
            }
        })
    }

接下来就是实现数据与页面绑定的关键了===>defineReactive方法。按照观察者模式，我们希望知道text和text2是否被调用，如果他们被调用，那么当他们改变的时候我们就需要重新刷新页面了。恰好，Object.defineProperty就提供对象被调用或被改变的回调。那么class Dep是用来干嘛的呢，简单的说是为了收集依赖：当vue遍历data的参数时，会在每次循环的函数闭包中生成一个Dep的实例，可以认为每个参数(text和text2)都有一个对应的Dep实例，当text或者text2被调用(即get()方法被调用)时，会将注册的事件(也就是代码里的Dep.target)添加到Dep实例的subs数组里，然后当text或者text2改变时，取出subs数组里收集到的订阅事件，然后循环执行所有的订阅。这样就实现了data改变到页面刷新的自动过程。

    constructor(options) {
        ...
        observer(options.data)
    }

    function observer(value, cb) {
        Object.keys(value).forEach((key) => defineReactive(value, key, value[key], cb))
    }

    function defineReactive(obj, key, val, cb) {
        // 每个属性都创建了一个dep实例，所以update方法被添加到了各自的dep.subs数组里
        const dep = new Dep()
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get: () => {
                if (Dep.target) {
                    dep.add(Dep.target)
                }
                return val
            },
            set: newVal => {
                if (newVal === val)
                    return
                val = newVal
                dep.notify()
            }
        })
    }

    class Dep {
        constructor() {
            this.subs = []
        }
        add(cb) {
            if(this.subs.indexOf(cb) === -1) {
                console.log('被添加到监听了')
                this.subs.push(cb)
            }
        }
        notify() {
            console.log('notify被触发了')
            this.subs.forEach((cb) => cb())
        }
    }

接着看订阅事件(也就是上面的Dep.target)具体指的是啥。

    constructor(options) {
        this.$options = options
        this._data = options.data
        Object.keys(options.data).forEach(key => this._proxy(key))
        observer(options.data)
        watch(this, this._render.bind(this), this._update.bind(this))
    }

    _render() {
        let VNode = this.$options.render.call(this)
        document.getElementById(this.$options.el).innerHTML = JSON.stringify(VNode)
        return VNode
    }

    _update() {
        console.log("我将要更新");
        const vdom = this._render.call(this)
    }

    function watch(vm, exp, cb) {
        // exp==>_render
        // cb==>update
        // 先执行一下render,并且让update方法watch this对象
        // 这一步比较巧妙，先把update这个cb放到target对象上。执行_render时，如果使用到了data上的对象，那么update就会被添加到dep里，也就实现了update watch data.
        Dep.target = cb
        let vdom = exp()
        Dep.target = null
        return vdom
    }

。。其实想想也就知道了，当然是数据改变，页面要重新渲染了。watch方法里有个很牛叉的地方：首先Dep.target = cb，将_update这个订阅事件赋给了Dep.target，然后执行了exp也就是_render方法，到最后执行的就是我们new Vue实例时传入的render方法，

    render() {
        return this.__h__('div', {}, [
            this.__h__('span', {}, [this.__toString__(this.text)]),
            this.__h__('span', {}, [this.__toString__(this.text2)])
        ])
    }

看，这个方法里调用了this.text和this.text2哎，于是text和text2的get回调被触发。

    get: () => {
        if (Dep.target) {
            dep.add(Dep.target)
        }
        return val
    },

由于Dep.target在上一刻神奇的被赋值(_update方法)了，所以_update被收进了text和text2的dep实例里，当render执行完后，Dep.target = null又被神奇的置为了空。

就这样当执行到demo.text = "after change text"时，_update方法被执行了，页面被重新渲染了。

## 小缺陷：_update方法被多次重复执行

当我们在一次setTimeout()里既改变text，又改变text2时，由于_update既被添加到了text的dep实例中，又被添加到了text2的dep实例中，所以_render会被执行两次。第一次_render后text被改变成新的了，document.getElementById(this.$options.el).innerHTML = ...执行，页面刷新；第二次_render后text2被改变成新的了，document.getElementById(this.$options.el).innerHTML = ...执行，页面又刷新；这看起来是期望得到了。但是由于js是同步执行的，这两次页面的改变的间隔几乎可以忽略不计，人眼肯定是无法差觉得。当页面复杂时，页面会由于回流或重绘造成性能问题。

此处解决的方法是使用Promise，在同步任务执行完后执行Microtask时更新页面：

    constructor(options) {
        this.queueNextTick = ''
    }

    _update() {
        if(!this.queueNextTick) {
            this.queueNextTick = new Promise((resolve)=>{
                resolve()
            })
            this.queueNextTick.then(()=>{
                console.log("我将要更新");
                const vdom = this._render.call(this)
                console.log(vdom);
                this.queueNextTick = ''
            })
        }
    }

https://juejin.im/post/5a4df4965188252a3d386ae6

> 参考(嗯90%)：

    [理解vue2.0的响应式架构.md](https://segmentfault.com/a/1190000007334535)

## VUE 1.0部分

[解析最简单的observer和watcher.md][https://github.com/georgebbbb/fakeVue/blob/master/1.%E8%A7%A3%E6%9E%90%E6%9C%80%E7%AE%80%E5%8D%95%E7%9A%84observer%E5%92%8Cwatcher.md]

## VUE 2.0 部分

[理解vue2.0的响应式架构.md][https://github.com/georgebbbb/fakeVue/blob/master/2.%E7%90%86%E8%A7%A3vue2.0%E7%9A%84%E5%93%8D%E5%BA%94%E5%BC%8F%E6%9E%B6%E6%9E%84.md]
