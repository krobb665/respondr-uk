<template>
  <div>
    <!-- Dashboard Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3 mb-0">Dashboard</h1>
      <button 
        class="btn btn-primary"
        @click="$router.push('/incidents/new')"
      >
        <i class="fas fa-plus me-2"></i>New Incident
      </button>
    </div>
    
    <!-- Stats Cards -->
    <div class="row mb-4">
      <div class="col-md-4 mb-3" v-for="stat in stats" :key="stat.title">
        <div class="card h-100" :class="['border-' + stat.variant]">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="text-uppercase text-muted mb-0">{{ stat.title }}</h6>
                <h2 class="mb-0">{{ stat.value }}</h2>
              </div>
              <div class="icon-shape" :class="['bg-' + stat.variant + '-subtle', 'text-' + stat.variant]">
                <i :class="stat.icon"></i>
              </div>
            </div>
            <p class="mt-3 mb-0 text-muted">
              <span :class="'text-' + stat.changeVariant + ' fw-bold'">
                <i :class="'fas fa-arrow-' + stat.changeDirection + ' me-1'"></i>{{ stat.change }}
              </span>
              <span class="text-nowrap">Since last month</span>
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Incidents Table -->
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Recent Incidents</h5>
        <div class="input-group" style="max-width: 300px;">
          <input 
            type="text" 
            class="form-control" 
            placeholder="Search incidents..."
            v-model="searchQuery"
          >
          <button class="btn btn-outline-secondary" type="button">
            <i class="fas fa-search"></i>
          </button>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Priority</th>
              <th>Location</th>
              <th>Status</th>
              <th>Reported</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody v-if="loading">
            <tr>
              <td colspan="7" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </td>
            </tr>
          </tbody>
          <tbody v-else-if="filteredIncidents.length === 0">
            <tr>
              <td colspan="7" class="text-center py-4">
                No incidents found
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr 
              v-for="incident in filteredIncidents" 
              :key="incident.id"
              @click="viewIncident(incident.id)"
              style="cursor: pointer;"
            >
              <td>#{{ incident.id.slice(0, 8) }}</td>
              <td>
                <span class="badge" :class="'bg-' + getIncidentTypeVariant(incident.type)">
                  {{ formatIncidentType(incident.type) }}
                </span>
              </td>
              <td>
                <span class="badge" :class="'bg-' + getPriorityVariant(incident.priority)">
                  {{ formatPriority(incident.priority) }}
                </span>
              </td>
              <td>{{ incident.location || 'N/A' }}</td>
              <td>
                <span class="badge" :class="'bg-' + getStatusVariant(incident.status)">
                  {{ formatStatus(incident.status) }}
                </span>
              </td>
              <td>{{ formatDate(incident.created_at) }}</td>
              <td>
                <button 
                  class="btn btn-sm btn-outline-primary"
                  @click.stop="viewIncident(incident.id)"
                >
                  View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card-footer d-flex justify-content-between align-items-center">
        <div class="text-muted">
          Showing <span class="fw-bold">{{ filteredIncidents.length }}</span> of 
          <span class="fw-bold">{{ incidents.length }}</span> incidents
        </div>
        <nav>
          <ul class="pagination mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="currentPage--">Previous</button>
            </li>
            <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: page === currentPage }">
              <button class="page-link" @click="currentPage = page">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="currentPage++">Next</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      incidents: [],
      loading: true,
      searchQuery: '',
      currentPage: 1,
      itemsPerPage: 10,
      stats: [
        { 
          title: 'Total Incidents', 
          value: '0', 
          icon: 'fas fa-clipboard-list',
          variant: 'primary',
          change: '12%',
          changeVariant: 'success',
          changeDirection: 'up'
        },
        { 
          title: 'Active Incidents', 
          value: '0', 
          icon: 'fas fa-exclamation-triangle',
          variant: 'warning',
          change: '5%',
          changeVariant: 'danger',
          changeDirection: 'up'
        },
        { 
          title: 'Average Response Time', 
          value: '12m 34s', 
          icon: 'fas fa-stopwatch',
          variant: 'info',
          change: '8%',
          changeVariant: 'success',
          changeDirection: 'down'
        }
      ]
    };
  },
  computed: {
    filteredIncidents() {
      const query = this.searchQuery.toLowerCase();
      return this.incidents.filter(incident => 
        (incident.type && incident.type.toLowerCase().includes(query)) ||
        (incident.location && incident.location.toLowerCase().includes(query)) ||
        (incident.status && incident.status.toLowerCase().includes(query)) ||
        (incident.priority && incident.priority.toLowerCase().includes(query))
      );
    },
    totalPages() {
      return Math.ceil(this.filteredIncidents.length / this.itemsPerPage);
    },
    paginatedIncidents() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredIncidents.slice(start, end);
    }
  },
  async created() {
    await this.fetchIncidents();
  },
  methods: {
    async fetchIncidents() {
      this.loading = true;
      try {
        // Get user's tenant type from their profile
        const { data: { user } } = await this.$supabase.auth.getUser();
        const { data: userData } = await this.$supabase
          .from('users')
          .select('tenant_type')
          .eq('id', user.id)
          .single();
        
        if (!userData) throw new Error('User data not found');
        
        // Fetch incidents for the user's tenant
        const { data: incidents, error } = await this.$supabase
          .from('incidents')
          .select('*')
          .eq('tenant_type', userData.tenant_type)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        this.incidents = incidents || [];
        
        // Update stats
        this.stats[0].value = this.incidents.length;
        this.stats[1].value = this.incidents.filter(i => i.status === 'active').length;
        
      } catch (error) {
        console.error('Error fetching incidents:', error);
        this.$toast.error('Failed to load incidents');
      } finally {
        this.loading = false;
      }
    },
    viewIncident(id) {
      this.$router.push(`/incidents/${id}`);
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleString();
    },
    formatIncidentType(type) {
      if (!type) return 'Unknown';
      return type.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    },
    formatPriority(priority) {
      return priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'N/A';
    },
    formatStatus(status) {
      return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'N/A';
    },
    getIncidentTypeVariant(type) {
      const variants = {
        medical_emergency: 'danger',
        fire: 'danger',
        security_breach: 'warning',
        disturbance: 'warning',
        assistance: 'info',
        other: 'secondary'
      };
      return variants[type] || 'secondary';
    },
    getPriorityVariant(priority) {
      const variants = {
        high: 'danger',
        medium: 'warning',
        low: 'info'
      };
      return variants[priority] || 'secondary';
    },
    getStatusVariant(status) {
      const variants = {
        reported: 'primary',
        assigned: 'info',
        in_progress: 'warning',
        resolved: 'success',
        cancelled: 'secondary'
      };
      return variants[status] || 'secondary';
    }
  }
};
</script>

<style scoped>
.icon-shape {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
}

.icon-shape i {
  font-size: 1.25rem;
}

.table > :not(caption) > * > * {
  padding: 1rem 1.5rem;
}

.table-hover > tbody > tr:hover {
  background-color: rgba(13, 110, 253, 0.05);
}

.badge {
  font-weight: 500;
  padding: 0.35em 0.65em;
}
</style>
