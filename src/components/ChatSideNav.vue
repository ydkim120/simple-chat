<template>
  <div class="chat-side-nav-wrap">
    <ul class="chat-side-nav -menu-info">
      <li>홈</li>
    </ul>
    <ul class="chat-side-nav -user-info">
      <li>유저 정보</li>
      <li>
        <button>로그아웃</button>
      </li>
    </ul>

  </div>
</template>

<script setup lang="ts">

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
  }
}
</style>