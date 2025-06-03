<template>
  <div class="row justify-content-center">
    <div class="col-md-6 col-lg-4">
      <div class="card shadow-sm">
        <div class="card-body p-4">
          <h2 class="text-center mb-4">Sign In</h2>
          
          <form @submit.prevent="handleLogin">
            <div v-if="error" class="alert alert-danger">{{ error }}</div>
            
            <div class="mb-3">
              <label for="email" class="form-label">Email address</label>
              <input 
                type="email" 
                class="form-control" 
                id="email" 
                v-model="email"
                required
                :disabled="loading"
              >
            </div>
            
            <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <input 
                type="password" 
                class="form-control" 
                id="password" 
                v-model="password"
                required
                :disabled="loading"
              >
            </div>
            
            <div class="d-grid gap-2">
              <button 
                type="submit" 
                class="btn btn-primary"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ loading ? 'Signing in...' : 'Sign In' }}
              </button>
            </div>
          </form>
          
          <div class="mt-3 text-center">
            <p class="mb-0">
              Don't have an account? 
              <router-link to="/signup">Sign up</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      error: '',
      loading: false
    };
  },
  methods: {
    async handleLogin() {
      this.error = '';
      this.loading = true;
      
      try {
        const { error } = await this.$supabase.auth.signInWithPassword({
          email: this.email,
          password: this.password
        });
        
        if (error) throw error;
        
        // Redirect to dashboard on successful login
        this.$router.push('/dashboard');
      } catch (error) {
        this.error = error.message || 'An error occurred during login';
        console.error('Login error:', error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
