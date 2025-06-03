<template>
  <div class="app-container d-flex flex-column min-vh-100">
    <!-- Navbar Component -->
    <Navbar 
      :is-authenticated="isAuthenticated" 
      :user="currentUser"
      @logout="handleLogout"
    />

    <!-- Toast Notifications -->
    <ToastNotification />

    <!-- Main Content -->
    <main class="main-content flex-grow-1">
      <div class="container py-4">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="$route.fullPath" />
          </transition>
        </router-view>
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer mt-auto py-3 bg-light">
      <div class="container">
        <div class="row">
          <div class="col-12 text-center">
            <span class="text-muted">© {{ currentYear }} Respondr UK. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  components: {
    Navbar,
    ToastNotification
  },
  data() {
    return {
      isAuthenticated: false,
      currentUser: null,
      currentYear: new Date().getFullYear()
    };
  },
  created() {
    this.setupAuthListener();
    this.checkAuth();
  },
  methods: {
    setupAuthListener() {
      this.$supabase.auth.onAuthStateChange((event, session) => {
        this.isAuthenticated = !!session?.user;
        if (session?.user) {
          this.fetchUserProfile(session.user);
        } else {
          this.currentUser = null;
        }
      });
    },
    async checkAuth() {
      const { data: { user } } = await this.$supabase.auth.getUser();
      this.isAuthenticated = !!user;
      if (user) {
        await this.fetchUserProfile(user);
      }
    },
    async fetchUserProfile(user) {
      try {
        const { data, error } = await this.$supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        this.currentUser = { ...user, ...data };
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    },
    async handleLogout() {
      try {
        await this.$supabase.auth.signOut();
        this.$router.push('/login');
        if (window.showToast) {
          window.showToast('You have been logged out successfully.', 'success');
        }
      } catch (error) {
        console.error('Error signing out:', error);
        if (window.showToast) {
          window.showToast('Failed to log out. Please try again.', 'danger');
        }
      }
    }
  }
};
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  padding-top: 1rem;
  padding-bottom: 2rem;
}

.footer {
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

/* Page Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive adjustments */
@media (max-width: 767.98px) {
  .main-content {
    padding-top: 0.5rem;
    padding-bottom: 1.5rem;
  }
  
  .footer {
    padding: 1rem 0;
  }
}
</style>
