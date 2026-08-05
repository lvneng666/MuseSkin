<template>
  <router-view />
  <Toast />
</template>

<script setup>
import { onMounted } from 'vue';
import Toast from './components/site/Toast.vue';
import { useAuthStore } from './stores/auth';

const auth = useAuthStore();
onMounted(() => auth.refresh());
</script>
