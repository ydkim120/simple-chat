import { createWebHistory, RouteRecordRaw, createRouter } from "vue-router"
import { useUserAuthStore } from '@/store/Auth.store'


const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: () => import('./views/Landing.vue')
  },
  // {
  //   path: "/login",
  //   name: "login-user",
  //   component: () => import('./views/Auth/LoginUser.vue')
  // },
  // {
  //   path: "/register",
  //   name: "register-user",
  //   component: () => import('./views/Auth/RegisterUser.vue')
  // },
  {
    path: "/chat",
    name: "chat-main",
    redirect: { name: 'chat-list' },
    meta: {
      requiresAuth: true
    },
    component: () => import('./views/Chat/ChatMain.vue'),
    children: [
      {
        path: "user-info",
        name: "chat-user-info",
        meta: {
          requiresAuth: true
        },
        component: () => import('./views/Auth/UserInfo.vue')
      },
      {
        path: "",
        name: "chat-list",
        meta: {
          requiresAuth: true
        },
        component: () => import('./views/Chat/ChatList.vue')
      },
      {
        path: "chat/:id",
        name: "chat-detail",
        meta: {
          requiresAuth: true
        },
        component: () => import('./views/Chat/ChatDetail.vue')
      },
      {
        path: "reserved",
        name: "reserved-chat-list",
        meta: {
          requiresAuth: true
        },
        component: () => import('./views/Chat/ReservedChatList.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  },
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useUserAuthStore()

  const { session } = await authStore.getSession()

  if (session) await authStore.saveToken(session)
  else if (authStore.isAuth) {
    const { data } = await authStore.refreshSession()
    if (!data?.user) {
      // alert('세션이 만료되었습니다. 다시 로그인 해주세요.')
      return await authStore.logoutUser()
    } else await authStore.saveToken(data.session)
  }
  
  if (authStore.isAuth) return next() 
  else if (to?.name !== 'home') return next({ name: 'home' })
  else next()
})

export default router;