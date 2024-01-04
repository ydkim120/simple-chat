import { createWebHistory, createRouter } from "vue-router"
import { useUserAuthStore } from '@/store/Auth.store'
import { supabase as sb } from '@/supabase'


const routes = [
  {
    path: "/",
    name: "login-user",
    component: () => import('./views/Auth/LoginUser.vue')
  },
  {
    path: "/register",
    name: "register-user",
    component: () => import('./views/Auth/RegisterUser.vue')
  },
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

  if (to.meta.requiresAuth) {
    const { session } = await authStore.getSession()

    if (session) await authStore.saveToken(session)
    else {
      const { data } = await authStore.refreshSession()
      if (!data?.user) {
        // alert('세션이 만료되었습니다. 다시 로그인 해주세요.')
        return await authStore.logoutUser()
      } else await authStore.saveToken(data.session)
    }

    if (authStore.isAuth && authStore.userInfo) {
      next()
      return
    } else return next({ name: 'login-user' })
  } else if (to.name !== 'login-user' && to.name !== 'register-user' ) {
    next({ name: 'login-user' })
  } else next()
})

export default router;