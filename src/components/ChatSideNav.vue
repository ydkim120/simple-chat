<template>
  <div class="chat-side-nav-wrap">
    <PanelMenu
      :model="sideNavList"
      class="chat-side-nav -menu-info"
    />
    <ul class="chat-side-nav -user-info">
      <li
        class="chat-side-nav-link"
        @click="router.push({ name: 'chat-user-info' })"
      >
        <UserProfilePhoto 
          :src="store.userInfo && store.userInfo.photo ? store.userInfo.photo : ''"
          width="80px"
          height="80px"
          empty-icon-font-size="50px"
        />
      </li>
      <li
        class="chat-side-nav-link"
        @click="router.push({ name: 'chat-user-info' })"
      >
        {{ userName ? userName : '유저 정보' }}
        <i class="pi pi-cog" />
      </li>
      <li class="chat-side-nav-link">
        <Button @click="handleLogout" label="로그아웃" />
      </li>
    </ul>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserAuthStore } from '@/store/Auth.store'
import { userInfoType } from '@/@types'

const store = useUserAuthStore()
const router = useRouter()

const userInfoData = ref<userInfoType | null>(null)
const userName = ref('')

watch(() => store.userInfo, (val) => {
  const userInfo = JSON.parse(JSON.stringify(val))
  if (userInfo) {
    userInfoData.value = userInfo
    userName.value = userInfo?.user_metadata?.user_name
  }
},
{ deep: true })

onMounted(() => {
  const userInfo = JSON.parse(JSON.stringify(store.userInfo))
  if (userInfo) {
    userInfoData.value = userInfo
    userName.value = userInfo?.user_metadata?.user_name
  }
})

const handleLogout = async () => {
  const done = confirm('로그아웃 하시겠습니까?')
  if (!done) return

  try {
    await store.logoutUser()
  } catch (error) {
    const errorMessage = store.getErrorMessage(error)
    if (errorMessage) alert(errorMessage)
  }
}

const sideNavList = ref([
  {
    label: '예약된 메세지',
    icon: 'pi pi-history',
    command: () => {
      router.push({ name: 'reserved-chat-list' })
    }
  },
  {
    label: 'DM',
    icon: 'pi pi-comments',
    command: () => {
      router.push({ name: 'chat-list' })
    }
  }
  // {
  //   label: 'Cloud',
  //   icon: 'pi pi-cloud',
  //   items: [
  //     {
  //       label: 'Upload',
  //       icon: 'pi pi-cloud-upload'
  //     },
  //     {
  //       label: 'Download',
  //       icon: 'pi pi-cloud-download'
  //     },
  //     {
  //       label: 'Sync',
  //       icon: 'pi pi-refresh'
  //     }
  //   ]
  // },
  // {
  //   label: 'Devices',
  //   icon: 'pi pi-desktop',
  //   items: [
  //     {
  //       label: 'Phone',
  //       icon: 'pi pi-mobile'
  //     },
  //     {
  //       label: 'Desktop',
  //       icon: 'pi pi-desktop'
  //     },
  //     {
  //       label: 'Tablet',
  //       icon: 'pi pi-tablet'
  //     }
  //   ]
  // }
])
</script>

<style scoped>
.chat-side-nav-wrap {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: calc(var(--header-height) + 40px) 30px 60px;
  background-color: var(--secondary);
  color: var(--white);
  .chat-side-nav {
    display: flex;
    flex-direction: column;
    gap:var(--gap-s);
    &.-user-info {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .chat-side-nav-link { 
      display: flex; 
      align-items: center; 
      gap: 10px; 
      cursor: pointer; 
    }
    & > li { text-align: center; margin: 0 auto; }
  }
}
</style>