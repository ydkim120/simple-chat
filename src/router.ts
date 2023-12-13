import { createWebHistory, createRouter } from "vue-router"
import { supabase as sb } from '@/supabase'

const routes = [
  {
    path: "/login",
    name: "login-user",
    component: () => import('./views/Auth/LoginUser.vue')
  },
  {
    path: "/register",
    name: "register-user",
    component: () => import('./views/Auth/RegisterUser.vue')
  },
  {
    path: "/",
    name: "chat-main",
    redirect: { name: 'chat-list' },
    component: () => import('./views/Chat/ChatMain.vue'),
    children: [
      {
        path: "chat",
        name: "chat-list",
        component: () => import('./views/Chat/ChatList.vue')
      },
      {
        path: "chat/:id",
        name: "chat-detail",
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
  routes,
})

router.beforeEach(async (to, from, next) => {
  // const user = supabase.auth.user();
  const { data: { session } } = await sb.auth.getSession()

  if (to.matched.some((res) => res.meta.auth)) {
    if (session?.user) {
      next()
      return
    }
    next({ name: 'login-user' })
    return
  }
  next()
});

export default router;