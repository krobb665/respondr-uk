<template>
  <div class="toast-container position-fixed top-0 end-0 p-3">
    <div 
      v-for="(toast, index) in toasts" 
      :key="index"
      class="toast show" 
      :class="getToastClasses(toast.variant)"
      role="alert" 
      aria-live="assertive" 
      aria-atomic="true"
    >
      <div class="d-flex">
        <div class="toast-body">
          <i :class="getToastIcon(toast.variant)" class="me-2"></i>
          {{ toast.message }}
        </div>
        <button 
          type="button" 
          class="btn-close btn-close-white me-2 m-auto" 
          data-bs-dismiss="toast" 
          aria-label="Close"
          @click="removeToast(index)"
        ></button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';

export default {
  name: 'ToastNotification',
  setup() {
    const toasts = ref([]);
    let toastId = 0;

    const showToast = (message, variant = 'primary', duration = 5000) => {
      const id = toastId++;
      const toast = { id, message, variant };
      
      toasts.value.push(toast);
      
      if (duration > 0) {
        setTimeout(() => {
          removeToastById(id);
        }, duration);
      }
      
      return id;
    };

    const removeToast = (index) => {
      toasts.value.splice(index, 1);
    };

    const removeToastById = (id) => {
      const index = toasts.value.findIndex(t => t.id === id);
      if (index !== -1) {
        toasts.value.splice(index, 1);
      }
    };

    const getToastIcon = (variant) => {
      const icons = {
        success: 'fas fa-check-circle',
        danger: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle',
        primary: 'fas fa-bell'
      };
      return icons[variant] || 'fas fa-bell';
    };

    // Make showToast available globally
    onMounted(() => {
      window.showToast = showToast;
    });

    onUnmounted(() => {
      delete window.showToast;
    });

    const getToastClasses = (variant) => {
      return {
        'bg-primary': variant === 'primary',
        'bg-success': variant === 'success',
        'bg-danger': variant === 'danger',
        'bg-warning': variant === 'warning',
        'bg-info': variant === 'info',
        'text-white': true
      };
    };

    return {
      toasts,
      showToast,
      removeToast,
      getToastIcon,
      getToastClasses
    };
  }
};
</script>

<style scoped>
.toast-container {
  z-index: 1100;
  max-width: 350px;
}

.toast {
  border: none;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.btn-close {
  opacity: 0.8;
}

.btn-close:hover {
  opacity: 1;
}
</style>
