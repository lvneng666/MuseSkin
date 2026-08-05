<template>
  <transition name="toast-fade">
    <div v-if="ui.toast" class="site-toast" role="status">
      <svg class="toast-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>{{ ui.toast }}</span>
    </div>
  </transition>
</template>

<script setup>
import { useUiStore } from '../../stores/ui';
const ui = useUiStore();
</script>

<style scoped>
.site-toast {
  position: fixed;
  top: 96px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 300;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #1f3a2b;
  color: #fff;
  padding: 15px 32px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.03em;
  box-shadow: 0 14px 36px rgba(31, 58, 43, 0.38);
  white-space: nowrap;
}
.toast-check {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}
.toast-fade-enter-active,
.toast-fade-leave-active { transition: all 0.32s cubic-bezier(0.21, 1.02, 0.73, 1); }
.toast-fade-enter-from,
.toast-fade-leave-to { opacity: 0; transform: translateX(-50%) translateY(-14px); }
</style>
