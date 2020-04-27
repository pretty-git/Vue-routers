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
