<template>
  <div class="chat-side-nav-wrap">
    <PanelMenu
      :model="sideNavList"
      class="chat-side-nav -menu-info"
    />
    <ul class="chat-side-nav -user-info">
      <li>유저 정보</li>
      <li>
        <Button @click="handleLogout" label="로그아웃" />
      </li>
    </ul>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { userAuthStore } from '@/store/Auth.store'

const store = userAuthStore()

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
    label: '홈',
    icon: 'pi pi-home',
  },
  {
    label: 'Cloud',
    icon: 'pi pi-cloud',
    items: [
      {
        label: 'Upload',
        icon: 'pi pi-cloud-upload'
      },
      {
        label: 'Download',
        icon: 'pi pi-cloud-download'
      },
      {
        label: 'Sync',
        icon: 'pi pi-refresh'
      }
    ]
  },
  {
    label: 'Devices',
    icon: 'pi pi-desktop',
    items: [
      {
        label: 'Phone',
        icon: 'pi pi-mobile'
      },
      {
        label: 'Desktop',
        icon: 'pi pi-desktop'
      },
      {
        label: 'Tablet',
        icon: 'pi pi-tablet'
      }
    ]
  }
])
</script>

<style scoped>
.chat-side-nav-wrap {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px 30px;
  background-color: var(--main-green2);
  color: var(--white);
  .chat-side-nav {
    display: flex;
    flex-direction: column;
    gap:var(--gap-s);
    &::ng-deep .p-panelmenu-header {
      & .p-panelmenu-header-content {
        background: transparent;
      }
      .p-panelmenu-header-action { padding: 0; }
    }
  }
}
</style>