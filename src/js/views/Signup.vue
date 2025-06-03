<template>
  <div class="row justify-content-center">
    <div class="col-md-8 col-lg-6">
      <div class="card shadow-sm">
        <div class="card-body p-4">
          <h2 class="text-center mb-4">Create an Account</h2>
          
          <form @submit.prevent="handleSignup">
            <div v-if="error" class="alert alert-danger">{{ error }}</div>
            
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="firstName" class="form-label">First Name</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="firstName" 
                  v-model="firstName"
                  required
                  :disabled="loading"
                >
              </div>
              
              <div class="col-md-6 mb-3">
                <label for="lastName" class="form-label">Last Name</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="lastName" 
                  v-model="lastName"
                  required
                  :disabled="loading"
                >
              </div>
            </div>
            
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
                minlength="8"
              >
              <div class="form-text">Password must be at least 8 characters long</div>
            </div>
            
            <div class="mb-4">
              <label for="confirmPassword" class="form-label">Confirm Password</label>
              <input 
                type="password" 
                class="form-control" 
                id="confirmPassword" 
                v-model="confirmPassword"
                required
                :disabled="loading"
              >
            </div>
            
            <div class="mb-4">
              <label class="form-label">I am a:</label>
              <div class="d-flex gap-4">
                <div class="form-check">
                  <input 
                    class="form-check-input" 
                    type="radio" 
                    id="medical" 
                    value="medical" 
                    v-model="userType"
                    :disabled="loading"
                  >
                  <label class="form-check-label" for="medical">
                    <i class="fas fa-ambulance me-1"></i> Medical Professional
                  </label>
                </div>
                <div class="form-check">
                  <input 
                    class="form-check-input" 
                    type="radio" 
                    id="security" 
                    value="security" 
                    v-model="userType"
                    :disabled="loading"
                  >
                  <label class="form-check-label" for="security">
                    <i class="fas fa-shield-alt me-1"></i> Security Personnel
                  </label>
                </div>
              </div>
            </div>
            
            <div class="d-grid gap-2">
              <button 
                type="submit" 
                class="btn btn-primary"
                :disabled="loading || !isFormValid"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ loading ? 'Creating Account...' : 'Create Account' }}
              </button>
            </div>
          </form>
          
          <div class="mt-3 text-center">
            <p class="mb-0">
              Already have an account? 
              <router-link to="/login">Sign in</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Signup',
  data() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      userType: 'medical',
      error: '',
      loading: false
    };
  },
  computed: {
    isFormValid() {
      return (
        this.firstName &&
        this.lastName &&
        this.email &&
        this.password.length >= 8 &&
        this.password === this.confirmPassword &&
        this.userType
      );
    }
  },
  methods: {
    async handleSignup() {
      if (this.password !== this.confirmPassword) {
        this.error = 'Passwords do not match';
        return;
      }
      
      this.error = '';
      this.loading = true;
      
      try {
        const { data, error } = await this.$supabase.auth.signUp({
          email: this.email,
          password: this.password,
          options: {
            data: {
              first_name: this.firstName,
              last_name: this.lastName,
              user_type: this.userType,
              tenant_type: this.userType
            }
          }
        });
        
        if (error) throw error;
        
        // Add user to the users table
        const { error: dbError } = await this.$supabase
          .from('users')
          .insert([
            { 
              id: data.user.id,
              email: this.email,
              first_name: this.firstName,
              last_name: this.lastName,
              user_type: this.userType,
              tenant_type: this.userType
            }
          ]);
        
        if (dbError) throw dbError;
        
        // Show success message and redirect to login
        this.$toast.success('Account created successfully! Please check your email to verify your account.');
        this.$router.push('/login');
      } catch (error) {
        this.error = error.message || 'An error occurred during signup';
        console.error('Signup error:', error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
