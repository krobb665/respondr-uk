<template>
  <div class="settings-container">
    <div class="container">
      <div class="row">
        <!-- Settings Sidebar -->
        <div class="col-lg-3 mb-4">
          <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
              <h2 class="h5 mb-0">Settings</h2>
            </div>
            <div class="list-group list-group-flush">
              <router-link 
                v-for="tab in tabs" 
                :key="tab.id"
                :to="{ name: tab.route }"
                class="list-group-item list-group-item-action"
                :class="{ 'active': isActive(tab.route) }"
              >
                <i :class="tab.icon" class="me-2"></i>
                {{ tab.label }}
              </router-link>
            </div>
          </div>
        </div>
        
        <!-- Settings Content -->
        <div class="col-lg-9">
          <div class="card shadow-sm
            <div class="card-body">
              <router-view v-slot="{ Component }">
                <transition name="fade" mode="out-in">
                  <component :is="Component" />
                </transition>
              </router-view>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

export default {
  name: 'SettingsView',
  setup() {
    const route = useRoute();
    
    const tabs = [
      { id: 'profile', label: 'Profile', icon: 'fas fa-user', route: 'Profile' },
      { id: 'security', label: 'Security', icon: 'fas fa-shield-alt', route: 'SecuritySettings' },
      { id: 'notifications', label: 'Notifications', icon: 'fas fa-bell', route: 'NotificationSettings' },
      { id: 'billing', label: 'Billing', icon: 'fas fa-credit-card', route: 'BillingSettings' },
      { id: 'team', label: 'Team', icon: 'fas fa-users', route: 'TeamSettings' }
    ];
    
    const isActive = (routeName) => {
      return route.name === routeName;
    };
    
    return {
      tabs,
      isActive
    };
  }
};
</script>

<style scoped>
.settings-container {
  padding: 2rem 0;
}

.list-group-item {
  border-left: none;
  border-right: none;
  padding: 0.75rem 1.25rem;
  color: #495057;
  transition: all 0.2s;
}

.list-group-item:first-child {
  border-top: none;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.list-group-item:last-child {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.list-group-item:hover {
  background-color: #f8f9fa;
  color: #0d6efd;
}

.list-group-item.active {
  background-color: #f0f7ff;
  color: #0d6efd;
  border-color: rgba(0, 0, 0, 0.125);
  font-weight: 500;
}

.list-group-item i {
  width: 1.25em;
  text-align: center;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  margin-bottom: 1.5rem;
}

.card-header {
  font-weight: 600;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

/* Responsive adjustments */
@media (max-width: 991.98px) {
  .settings-container {
    padding: 1rem 0;
  }
  
  .col-lg-3 {
    margin-bottom: 1.5rem;
  }
}

/* Fade transition for router view */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
