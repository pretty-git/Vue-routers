/* eslint-disable no-irregular-whitespace */
import Vue from 'vue'
import axios from 'axios'
import 'normalize.css/normalize.css' // A modern alternative to CSS resets
import { MessageBox } from 'element-ui'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import '@/styles/index.scss' // global css
import Cookies from 'js-cookie'
import App from './App'
import store from './store'
import router from './router'
import VueAreaLinkage from 'vue-area-linkage'
import 'vue-area-linkage/dist/index.css'
import '@/icons' // icon
import '@/permission' // permission control
Vue.use(VueAreaLinkage)
Vue.prototype.$qnyUrl = 'http://qiniu.qm65.com/'
// Vue.prototype.$URL = 'http://www.vnjohn.info/trench-api'
// Vue.prototype.$URL = 'http://localhost:8090'
Vue.prototype.$URL = 'http://192.168.0.14:8090'
// set ElementUI lang to EN
Vue.use(ElementUI, { locale })
const globalRequest = function request(cfg1) {
  return new Promise(function(resolve, reject) {
    var Authorization
    if (cfg1.Authorization === '' || cfg1.Authorization === undefined || cfg1.Authorization === null) {
      Authorization = Cookies.get('Authorization')
    } else {
      Authorization = cfg1.Authorization
    }
    // // console.log(Authorization, '发出的请求token')
    var headers = 'json'
    if (cfg1.headers === 'www') {
      headers = {
        'Authorization': Authorization,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    } else {
      headers = {
        'Authorization': Authorization,
        'Content-Type': 'application/json'
      }
    }
    const cfg = {
      method: cfg1.method,
      url: cfg1.url,
      headers: headers
    }
    if (cfg1.method === 'get' || cfg.method === 'GET') {
      cfg.params = cfg1.data
    } else {
      cfg.data = cfg1.data
    }
    const res = axios(cfg)
    try {
      resolve(res)
    } catch (e) {
      reject(e)
    }
  })
}
Vue.prototype.$http = async function request(cfg) {
  const data = await globalRequest(cfg)
  console.log(data.data.status, 'data.data.status')
  if (data.data.status === 333) {
    // to re-login
    MessageBox.confirm(data.data.msg, '提示', {
      confirmButtonText: '重新登录',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      store.dispatch('user/resetToken').then(() => {
        location.reload()
      })
    })
  } else if (data.data.status === 403) {
    this.$message.error('暂时无权限查看')
    router.push('/') // 重定向到首页
    data.data.data = {
      row: [],
      records: 0
    }
    return data
  } else if (data.data.status === 500) {
    this.$message.error('数据请求失败')
  }
  return data
}
Vue.prototype.resolvingDate = function resolvingDate(date) {
  // date是传入的时间
  const d = new Date(date)

  const month = (d.getMonth() + 1) < 10 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1)
  const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate()
  const hours = d.getHours() < 10 ? '0' + d.getHours() : d.getHours()
  const min = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()
  const sec = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds()

  const times = d.getFullYear() + '-' + month + '-' + day + ' ' + hours + ':' + min + ':' + sec

  return times
}
Vue.config.productionTip = false
// router.beforeEach((to, from, next) => {
//   if (store.getters.token) { // 判断是否有token
//     // console.log(store.getters.toke, 'token')
//     if (to.path === '/login') {
//       next({ path: '/' })
//     } else {
//       if (store.getters.roles.length === 0) { // 判断当前用户是否已拉取完user_info信息
//         // store.dispatch('GetInfo').then(res => { // 拉取info
//         //   const roles = res.data.role
//         //   store.dispatch('GenerateRoutes', { roles }).then(() => { // 生成可访问的路由表
//         //     router.addRoutes(store.getters.addRouters) // 动态添加可访问路由表
//         //     next({ ...to, replace: true }) // hack方法 确保addRoutes已完成 ,set the replace: true so the navigation will not leave a history record
//         //   })
//         // }).catch(err => {
//         //   // console.log(err)
//         // })
//         next('/login')
//       } else {
//         next()
//       }
//     }
//   } else {
//     // if ( whiteList.indexOf(to.path) !== -1) { // 在免登录白名单，直接进入
//     //   next()
//     // } else {
//     //   next('/login') // 否则全部重定向到登录页
//     // }
//   }
// })
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
