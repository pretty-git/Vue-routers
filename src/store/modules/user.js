// import { login, logout, getInfo } from '@/api/user'
import { login, logout } from '@/api/user'
import Cookies from 'js-cookie'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'
import { StaticRouterMap } from '@/router/index'
import md5 from 'js-md5'
const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',
    roles: [],
    init: false, // 是否完成初始化 // 默认未完成
    routerList: [] // 动态路由
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
    console.log(RouterList, '==============RouterList2222==========')
    state.routerList = RouterList
  },
  set_init: (state, status) => {
    console.log(status, '2222222222222222')
    state.init = status
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: md5(password), rememberMe: true }).then(response => {
        const data = response
        // console.log("有戏>>>>>>>"+JSON.stringify(data.data.msg))
        console.log(data)
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        commit('SET_NAME', data.userInfo.userName)
        // Cookies.set('type', data.userInfo.type)
        // Cookies.set('uId', data.userInfo.id)
        Cookies.set('userInfo', data.userInfo)
        Cookies.set('routes', data.menuList)
        // commit('SET_AVATAR', data.userInfo.avatar)
        resolve(data)
        // document.cookie = 'Authorization' + '=' + escape(data.token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  setRouterList({ commit }, routerList) {
    console.log(StaticRouterMap.concat(routerList), '=============routerList=================')
    commit('set_router', StaticRouterMap.concat(routerList)) // 进行路由拼接并存储
  },
  // 存储颗粒话权限
  setroles({ commit }, roleList) {
    commit('SET_ROLES', roleList)
  },

  // user logout
  logout({ commit, state }, userInfo) {
    return new Promise((resolve, reject) => {
      logout(userInfo).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('set_init', false)
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

