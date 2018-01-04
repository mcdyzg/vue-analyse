function VNode(tag, data, children, text) {
    return {tag, data, children, text}
}

class Vue {
    constructor(options) {
        this.queueNextTick = ''

        this.$options = options
        this._data = options.data
        Object.keys(options.data).forEach(key => this._proxy(key))
        observer(options.data)
        const vdom = watch(this, this._render.bind(this), this._update.bind(this))
        console.log(vdom)
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
    _render() {
        let VNode = this.$options.render.call(this)
        document.getElementById(this.$options.el).innerHTML = JSON.stringify(VNode)
        return VNode
    }
    __h__(tag, attr, children) {
        return VNode(tag, attr, children.map((child) => {
            if (typeof child === 'string') {
                return VNode(undefined, undefined, undefined, child)
            } else {
                return child
            }
        }))
    }
    __toString__(val) {
        return val == null? '': typeof val === 'object'? JSON.stringify(val, null, 2): String(val);
    }
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
function watch(vm, exp, cb) {
    // exp==>_render
    // cb==>update
    // 先执行一下render,并且让update方法watch this对象
    // 这一步比较巧妙，先把update这个cb放到target对象上，exp方法就是render方法，执行render时，如果使用到了data上的对象，那么update就会被添加到dep里，也就实现了update watch data.
    Dep.target = cb
    let vdom = exp()
    Dep.target = null
    return vdom
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
Dep.target = null

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
    // 因为每个属性都有各自的dep实例，所以改变两次，update方法（也就是render方法执行了两次）
    demo.text = "after change text"
    demo.text2 = "after change text2"
}, 2000)

setTimeout(function() {
    demo.text = "after after change text"
    demo.text2 = "after after change text2"
}, 3000)
