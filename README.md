<!-- 예시 -->
# Simple Messenger

## Stacks

<div align=center> 
  <img src="https://img.shields.io/badge/Vue.js 3.0-4FC08D?style=flat-square&logo=Vue.js&logoColor=white"> 
  <img src="https://img.shields.io/badge/Typescript-3178C6?style=flat-square&logo=Typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/CSS-1572B6?style=flat-square&logo=css3&logoColor=white"> 
  <br>
  
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white">
  <br>
  
  <img src="https://img.shields.io/badge/vite-%23646CFF?style=flat-square&logo=vite&logoColor=white">
  
  <img src="https://img.shields.io/badge/Github-181717?style=flat-square&logo=github&logoColor=white">
  <img src="https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white">
  <br>
</div>

## 💬 Overview

Simple Messenger(임시)는 Supabase를 사용한 실시간 일대일 채팅 서비스입니다.<br>
Vue3.0 + Typescript + Supabase로 개발 중입니다. 🌝

구현 중인 서비스는 아래와 같습니다. 
* 이메일 기반 로그인 / 로그아웃
* 이메일 기반 회원가입 (이메일 인증 후 서비스 이용 가능)
* 사용자 정보 수정 (비밀번호, 프로필 사진, 닉네임)
* 사용자 찾기
* 실시간 메세지 송수신
* 새 메세지 알람
* 예약 메세지



## Local Server
```
npm run dev
```


## 🔎 I Learned

1. 1회차 (2023.12.06 ~ 2023.12.29)
    * `Vite` + `Vue3` + `Typescript` 프로젝트 세팅
    * `Supabase` 사용법 (간단한 PostgreSQL 문법)
      - 인증 구현
      - 데이터 CRUD
      - Storage(Bucket)를 이용한 File 관리
    * Vue3에서 새로 추가된 함수 기반 API인 `Composition API` 살펴보기
    * Typescript 랑 친해지는 중 🫶

2. 2회차 (2024.1.2 ~ )
    * `Supabase`
      - RealTime > Postgres Changes을 통해 테이블 변경 감지
      - RealTime > Presence로 사용자 실시간 활동 상태(온/오프라인) 감지
      - cron: Job Scheduling 기능 예약 메세지 로직 구현
      - trigger를 통한 새 메세지 알람 기능
    * 회원 탈퇴 기능

<!-- ## Learning Objectives -->


## 📚 Homework
1. 1회차 (2023.12.06 ~ 2023.12.29)
    * PostgreSQL 좀 더 깊게 알아보기
    * 기능 보완
      - 로딩 구현
      - 새로운 메신저 수신 시 알람 기능
      - 그룹 채팅 기능
      - 예약 메세지 기능
      - 사용자 실시간 활동 상태 표시
      - 채팅방 나가기
      - 새 메세지 알람 기능
      - 라우팅 변경 시 세션 유지 검토


<!-- ## Helpful Links -->

<!-- * [Version Control](https://en.wikipedia.org/wiki/Version_control) -->

- - -
