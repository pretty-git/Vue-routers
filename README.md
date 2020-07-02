 ## 先定义好路由，包括常页面路由和需要权限的路由数组

```javascript
import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)
import Layout from '@/layout'
export const StaticRouterMap = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Home',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '首页', icon: 'dashboard' }
    }]
  }
]
export const AsyncRouterMap = []
const createRouter = () =>
  new Router({
    scrollBehavior: () => ({ y: 0 }),
    routes: StaticRouterMap
  })
const router = createRouter()
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}
export default router

```
## 第二步和后台沟通返回的数据结构样式

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200427180226958.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM3MjQxOTM0,size_16,color_FFFFFF,t_70)

## 第三步解析后台数据
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020051114284236.png)

```javascript
/**
 * 生成路由
 * @param {Array} routerlist 格式化路由
 * @returns
 */
export function addRouter(routerlist) {
  const router = []
  try {
    routerlist.forEach(e => {
      if (e.path !== 'button') {
        let e_new = {
          path: e.redirect,
          name: e.path.split('/')[e.path.split('/').length - 1],
          redirect: e.path,
          component: () => e.path === 'layout' ? import('@/layout') : import('@/layout')
        }
        if (e.children) {
          const children = addRouterchild(e.children)
          // 保存权限
          e_new = { ...e_new, children: children }
        }
        if (e.path) {
          e_new = { ...e_new, redirect: e.path }
        }
        if (e.path) {
          e_new = { ...e_new, alwaysShow: true }
        }
        e_new = { ...e_new, meta: { title: e.title }}
        router.push(e_new)
      }
    })
  } catch (error) {
    console.error(error)
    return []
  }
  return router
}

export function addRouterchild(routerlist) {
  const router = []
  try {
    routerlist.forEach(e => {
      if (e.path !== 'button') {
        let e_new = {
          path: e.redirect,
          name: e.path.split('/')[e.path.split('/').length - 1],
          component: (resolve) => require([`@/views${e.path}`], resolve)
        }
        e_new = { ...e_new, meta: { title: e.title }}
        router.push(e_new)
      }
    })
  } catch (error) {
    console.error(error)
    return []
  }
  return router
}

```
## 第四步在permission.js文件对每次的刷新做判断

```javascript

router.beforeEach((to, from, next) => {
  NProgress.start()
  if (Cookies.get('Authorization')) {
    // 判断cookice是否存在 不存在即为未登录
    if (to.path !== '/login') {
      if (user.state.init) {
        // 获取了动态路由 data一定true,就无需再次请求 直接放行
        next()
      } else {
        // data为false,一定没有获取动态路由,就跳转到获取动态路由的方法
        gotoRouter(to, next)
      }
    } else {
      Message({ message: '您已经登录', type: 'info' })
      next('/')
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      // 免登陆白名单 直接进入
      next()
    } else {
      if (to.path !== '/login') {
        // 重定向到登录页面 不能这么写 因为假如之前的角色是 管理员页面 后又登陆了非管理员 重定向的页面就可能不存在,就会导致404
        // next(`/login?redirect=${to.path}`)
        next('/login')
      } else {
        next()
      }
    }
  }
})

router.afterEach((to, from) => {
  NProgress.done() // 结束Progress
})
function getRouter() {
  var userId = JSON.parse(Cookies.get('userInfo')).userId
  return request({
    url: `/index/getMenuInfoByUId/${userId}`,
    method: 'get'
  })
  // return p
}
function gotoRouter(to, next) {
  getRouter() // 获取动态路由的方法
    .then(res => {
      const asyncRouter = addRouter(res.data) // 进行递归解析
      asyncRouter.push({
        path: '*',
        redirect: '/404',
        hidden: true
      })
      store.dispatch('user/setRouterList', asyncRouter) // 存储到vuex
      router.addRoutes(asyncRouter) // vue-router提供的addRouter方法进行路由
      // store.dispatch('user/GetInfo')
      store.commit('user/set_init', true)
      next({ ...to, replace: true }) // hack方法 确保addRo
    })
    .catch(e => {
      removeToken()
    })
}

```
## 第五步在登录接口进行路由拼接

```javascript

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',
    roles: [],
    init: false, // 是否完成初始化 // 默认未完成  入过坑没加这个
    routerList: [] // 动态路由 如果坑没加这个会发生切换账号会保留上一个账号的路由信息
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  set_router: (state, RouterList) => {
    console.log(RouterList, 
    state.routerList = RouterList
  },
  set_init: (state, status) => {
    state.init = status //是permission.js中的初始化判断
    // 注意data中要引入
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: md5(password), rememberMe: true }).then(response => {
        const data = response
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        commit('SET_NAME', data.userInfo.userName)
        Cookies.set('userInfo', data.userInfo)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  setRouterList({ commit }, routerList) {
    commit('set_router', StaticRouterMap.concat(routerList)) // 进行路由拼接并存储
  },

  // user logout
  logout({ commit, state }, userInfo) {
    return new Promise((resolve, reject) => {
      logout(userInfo).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('set_init', false) //重置初始化
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}


```

## 需要把拼接好的路由导出
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020051114330987.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM3MjQxOTM0,size_16,color_FFFFFF,t_70)
```javascript
const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  routerList: state => state.user.routerList //划重点语句，少写就不会渲染了
}
export default getters

```
## 注意侧边栏渲染的vue页面中，
![在这里插入图片描述](https://img-blog.csdnimg.cn/202005111657290.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM3MjQxOTM0,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200511165623540.png)
改成：![在这里插入图片描述](https://img-blog.csdnimg.cn/20200511165637562.png)

## 效果图：
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200427180605652.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM3MjQxOTM0,size_16,color_FFFFFF,t_70)
## 欢迎去我的github Star
[点赞我的github](https://github.com/pretty-git/Vue-routers)
