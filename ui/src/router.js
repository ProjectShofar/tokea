export default [{
    path: '/',
    exact: true,
    layout: true,
    trunk: () => import('@/pages/index')
  }, {
    path: '/start',
    exact: true,
    layout: false,
    trunk: () => import('@/pages/start')
  }
]
  