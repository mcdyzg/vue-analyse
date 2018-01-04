import Dep from './observer/dep'

export default class Watcher {
  constructor(vm, expOrFn, cb) {
    this.cb = cb
    this.vm = vm
    //此处简化
    this.expOrFn = expOrFn
    this.value = this.get()
  }
  update(){
    this.run()
  }
  run(){
    const  value = this.get()
    if(value !==this.value){
      this.value = value
      this.cb.call(this.vm)
    }
  }
  addDep(dep){
    dep.addSub(this)
  }
  beforeGet(){


  }
  afterGet(){

  }
  get(){
    Dep.target = this
    //此处简化。。要区分fuction还是expression。
    // 这句是最重要的，此处取值会触发this.vm._data[this.expOrFn]的get方法,从而将此watch实例添加到了this.vm._data[this.expOrFn]的dep属性的subs里
    const value = this.vm._data[this.expOrFn]
    Dep.target = null
    return value
  }
}
