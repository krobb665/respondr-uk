<template>
  <div class="loading-spinner d-flex flex-column align-items-center justify-content-center" :class="{ 'full-screen': fullScreen, 'inline': !fullScreen }">
    <div class="spinner-border text-primary" :class="sizeClass" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    <p v-if="message" class="mt-2 mb-0 text-muted">{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    fullScreen: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg'].includes(value)
    },
    message: {
      type: String,
      default: ''
    }
  },
  computed: {
    sizeClass() {
      return {
        'spinner-border-sm': this.size === 'sm',
        'spinner-border-lg': this.size === 'lg'
      };
    }
  }
};
</script>

<style scoped>
.loading-spinner {
  padding: 2rem 0;
}

.loading-spinner.full-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 9999;
  padding: 0;
  margin: 0;
}

.loading-spinner.inline {
  min-height: 200px;
}
</style>
