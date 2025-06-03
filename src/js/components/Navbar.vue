<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/">
        <i class="fas fa-first-aid me-2"></i>Respondr UK
      </router-link>
      
      <button 
        class="navbar-toggler" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarNav"
        aria-controls="navbarNav" 
        aria-expanded="false" 
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto" v-if="isAuthenticated">
          <li class="nav-item">
            <router-link class="nav-link" to="/dashboard" :class="{ active: $route.path === '/dashboard' }">
              <i class="fas fa-tachometer-alt me-1"></i> Dashboard
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/incidents/new" :class="{ active: $route.path === '/incidents/new' }">
              <i class="fas fa-plus-circle me-1"></i> New Incident
            </router-link>
          </li>
        </ul>
        
        <ul class="navbar-nav ms-auto">
          <template v-if="isAuthenticated">
            <li class="nav-item dropdown">
              <a 
                class="nav-link dropdown-toggle d-flex align-items-center" 
                href="#" 
                id="userDropdown" 
                role="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                <div class="user-avatar me-2">
                  <i class="fas fa-user-circle"></i>
                </div>
                <span class="d-none d-lg-inline">{{ userInitials }}</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li>
                  <div class="dropdown-header">
                    <div class="d-flex align-items-center">
                      <div class="user-avatar me-2">
                        <i class="fas fa-user-circle fa-2x"></i>
                      </div>
                      <div>
                        <div class="fw-bold">{{ userDisplayName }}</div>
                        <div class="small text-muted">{{ userEmail }}</div>
                      </div>
                    </div>
                  </div>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <router-link class="dropdown-item" to="/profile">
                    <i class="fas fa-user me-2"></i>Profile
                  </router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/settings">
                    <i class="fas fa-cog me-2"></i>Settings
                  </router-link>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item" href="#" @click.prevent="handleLogout">
                    <i class="fas fa-sign-out-alt me-2"></i>Logout
                  </a>
                </li>
              </ul>
            </li>
          </template>
          <template v-else>
            <li class="nav-item">
              <router-link class="nav-link" to="/login" :class="{ active: $route.path === '/login' }">
                <i class="fas fa-sign-in-alt me-1"></i> Login
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/signup" :class="{ active: $route.path === '/signup' }">
                <i class="fas fa-user-plus me-1"></i> Sign Up
              </router-link>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'AppNavbar',
  props: {
    isAuthenticated: {
      type: Boolean,
      required: true
    },
    user: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props, { emit }) {
    const router = useRouter();
    
    const userDisplayName = computed(() => {
      if (props.user && props.user.first_name && props.user.last_name) {
        return `${props.user.first_name} ${props.user.last_name}`;
      }
      return props.user?.email || 'User';
    });
    
    const userEmail = computed(() => {
      return props.user?.email || '';
    });
    
    const userInitials = computed(() => {
      if (props.user?.first_name && props.user?.last_name) {
        return `${props.user.first_name[0]}${props.user.last_name[0]}`.toUpperCase();
      }
      return props.user?.email?.[0]?.toUpperCase() || 'U';
    });
    
    const handleLogout = async () => {
      emit('logout');
    };
    
    // Initialize Bootstrap dropdowns
    onMounted(() => {
      // This will be handled by Bootstrap's data-bs-toggle
    });
    
    return {
      userDisplayName,
      userEmail,
      userInitials,
      handleLogout
    };
  }
};
</script>

<style scoped>
.navbar {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0.75rem 1rem;
}

.navbar-brand {
  font-weight: 600;
  font-size: 1.25rem;
}

.nav-link {
  font-weight: 500;
  padding: 0.5rem 1rem;
  transition: all 0.2s;
}

.nav-link i {
  width: 1.25em;
  text-align: center;
}

.nav-link.active {
  font-weight: 600;
  position: relative;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 1rem;
  right: 1rem;
  height: 3px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 3px 3px 0 0;
}

.user-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1.5rem;
}

.dropdown-menu {
  border: none;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  border-radius: 0.5rem;
  margin-top: 0.5rem;
  min-width: 240px;
}

.dropdown-header {
  padding: 0.75rem 1rem;
  color: #6c757d;
  font-size: 0.875rem;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  font-weight: 500;
  color: #212529;
  transition: all 0.2s;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  color: #0d6efd;
}

.dropdown-divider {
  margin: 0.5rem 0;
  border-top: 1px solid #e9ecef;
}

/* Responsive adjustments */
@media (max-width: 991.98px) {
  .navbar-collapse {
    padding: 1rem 0;
  }
  
  .nav-item {
    margin: 0.25rem 0;
  }
  
  .dropdown-menu {
    margin-top: 0;
    border-radius: 0;
    box-shadow: none;
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .dropdown-item {
    padding: 0.5rem 1.5rem;
  }
}
</style>
