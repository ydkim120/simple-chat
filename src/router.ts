import { createWebHistory, createRouter } from "vue-router";

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
        path: "chat-list",
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
});

export default router;