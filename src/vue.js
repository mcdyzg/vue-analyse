// import Observer from './observer'
import Vue from './instance/vue'


const v = new Vue({
  data:{
    a:'a',
    b:{
      c:'c'
    }
  }
})


v.$watch("a",function(){console.log("a被改变")}) // 此处如果用箭头函数，this指向undefined
v.$watch("b",()=>console.log("b被改变"))

setTimeout(()=>{
  v.a = 4
  // 此处改变b.c的值，但是我们的监听只监听了b属性，b依然指向原来那个对象，所以b的监听不会被触发，但是当前watch方法是无法监听到b.c的
  v.b.c = 5

},1000)

setTimeout(()=>{
  v.a = 5

},2000)
