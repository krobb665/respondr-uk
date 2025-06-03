<template>
  <div class="not-found text-center py-5">
    <div class="container">
      <h1 class="display-1 text-primary">404</h1>
      <h2 class="mb-4">Page Not Found</h2>
      <p class="lead mb-4">The page you're looking for doesn't exist or has been moved.</p>
      <router-link to="/dashboard" class="btn btn-primary">
        <i class="fas fa-arrow-left me-2"></i>Return to Dashboard
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
  metaInfo: {
    title: '404 - Page Not Found'
  }
};
</script>

<style scoped>
.not-found {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.display-1 {
  font-size: 8rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.btn {
  padding: 0.5rem 1.5rem;
  font-weight: 500;
}
</style>
