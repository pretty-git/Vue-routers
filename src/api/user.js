import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/myLoginForm?username=' + data.username + '&password=' + data.password,
    method: 'post'
  })
}

// export function getInfo(token) {
//   return request({
//     url: '/vue-admin-template/user/info',
//     method: 'get',
//     params: { token }
//   })
// }

export function logout(data) {
  return request({
    url: '/logout',
    method: 'get',
    data
  })
}
