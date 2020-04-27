import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
var url = ''
if (process.env.NODE_ENV === 'production') {
  url = 'http://api1.shilrna.com' // 线上api地址
} else {
  // url = 'http://localhost:8090'
  // url = 'http://www.vnjohn.info/trench-api'
  // url = 'http://api1.shilrna.com'
  url = 'http://192.168.0.14:8090'
}
// create an axios instance
const service = axios.create({
  baseURL: url, // url = base url + request url
  withCredentials: false, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['X-Token'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    // console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data
    // console.log('code>>>>>>>>',res)
    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== 200 && res.code !== '200') {
      // console.log(res.code,'ssss>>>>')
      Message({
        message: res.msg || '连接失败',
        type: 'error',
        duration: 5 * 1000
      })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === 400 || res.code === 404 || res.code === '400' || res.code === '404') {
        // to re-login
        MessageBox.confirm('登录异常，请重新登录', 'Confirm logout', {
          confirmButtonText: 'Re-Login',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else if (res.code === 200) {
      return res
    }
  },
  // error => {
  //   // console.log('err' + error) // for debug
  //   // Message({
  //   //   message: error.message,
  //   //   type: 'error',
  //   //   duration: 5 * 1000
  //   // })
  //   return Promise.reject(error)
  // }
)

export default service
