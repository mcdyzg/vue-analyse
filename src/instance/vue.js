import Watcher from '../watcher'
import {observe} from "../observer"

export default class Vue {
  constructor (options={}) {
    //这里简化了。。其实要merge
    this.$options=options
    //这里简化了。。其实要区分的
    // 把data备份给this._data属性
    let data = this._data=this.$options.data
    Object.keys(data).forEach(key=>this._proxy(key))
    data.a = 'a'
    // 这里的data保存着this.$options.data对象的指针
    console.log(this._data.a)
    observe(data,this)
  }


  $watch(expOrFn, cb, options){
      // expOrFn要观察的属性名
    new Watcher(this, expOrFn, cb)
  }

  _proxy(key) {

    var self = this
    Object.defineProperty(self, key, {
      configurable: true,
      enumerable: true,
      get: function proxyGetter () {
        return self._data[key]
      },
      set: function proxySetter (val) {
        self._data[key] = val
      }
    })
  }


}
