<template>
  <div v-if="loading" class="text-center my-5">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    <p class="mt-2">Loading incident details...</p>
  </div>
  
  <div v-else-if="!incident" class="alert alert-danger">
    <i class="fas fa-exclamation-circle me-2"></i>
    Incident not found or you don't have permission to view it.
  </div>
  
  <div v-else class="incident-details">
    <!-- Header with back button -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <button class="btn btn-link p-0 mb-2" @click="$router.go(-1)">
          <i class="fas fa-arrow-left me-2"></i> Back
        </button>
        <h1 class="h3 mb-0">Incident #{{ incident.id.slice(0, 8) }}</h1>
      </div>
      <div>
        <span class="badge me-2" :class="`bg-${getStatusVariant(incident.status)}`">
          {{ formatStatus(incident.status) }}
        </span>
      </div>
    </div>

    <!-- Main content -->
    <div class="row">
      <div class="col-lg-8">
        <!-- Incident details card -->
        <div class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Incident Information</h5>
            <div>
              <span class="badge me-2" :class="`bg-${getIncidentTypeVariant(incident.type)}`">
                {{ formatIncidentType(incident.type) }}
              </span>
              <span class="badge" :class="`bg-${getPriorityVariant(incident.priority)}`">
                {{ formatPriority(incident.priority) }}
              </span>
            </div>
          </div>
          <div class="card-body">
            <div class="row mb-3">
              <div class="col-md-6">
                <h6>Reported By</h6>
                <p>{{ incident.reported_by || 'System' }}</p>
              </div>
              <div class="col-md-6">
                <h6>Reported On</h6>
                <p>{{ formatDateTime(incident.created_at) }}</p>
              </div>
            </div>
            
            <div class="mb-3">
              <h6>Description</h6>
              <p class="text-muted">{{ incident.description || 'No description provided' }}</p>
            </div>
            
            <div class="mb-3">
              <h6>Location</h6>
              <p>
                <i class="fas fa-map-marker-alt text-danger me-2"></i>
                {{ incident.location || 'Location not specified' }}
              </p>
              <div id="incident-map" style="height: 200px;" class="border rounded"></div>
            </div>
            
            <div v-if="incident.notes" class="mb-3">
              <h6>Additional Notes</h6>
              <p class="text-muted">{{ incident.notes }}</p>
            </div>
          </div>
        </div>
        
        <!-- Activity timeline -->
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Activity Timeline</h5>
          </div>
          <div class="card-body">
            <div class="timeline">
              <div v-for="(activity, index) in activities" :key="index" class="timeline-item">
                <div class="timeline-badge">
                  <i :class="getActivityIcon(activity.type)"></i>
                </div>
                <div class="timeline-content">
                  <div class="d-flex justify-content-between">
                    <h6 class="mb-1">{{ activity.title }}</h6>
                    <small class="text-muted">{{ formatTimeAgo(activity.timestamp) }}</small>
                  </div>
                  <p class="mb-1">{{ activity.description }}</p>
                  <small class="text-muted">By {{ activity.user || 'System' }}</small>
                </div>
              </div>
              
              <div v-if="activities.length === 0" class="text-center py-3 text-muted">
                No activity recorded yet
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Sidebar -->
      <div class="col-lg-4">
        <!-- Status update -->
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">Update Status</h5>
          </div>
          <div class="card-body">
            <select class="form-select mb-3" v-model="newStatus">
              <option value="reported">Reported</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button 
              class="btn btn-primary w-100"
              @click="updateStatus"
              :disabled="newStatus === incident.status"
            >
              Update Status
            </button>
          </div>
        </div>
        
        <!-- Assigned unit -->
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">Assigned Unit</h5>
          </div>
          <div class="card-body">
            <div v-if="assignedUnit" class="d-flex align-items-center">
              <div class="avatar me-3">
                <span class="avatar-text bg-primary text-white">
                  {{ getInitials(assignedUnit.name) }}
                </span>
              </div>
              <div>
                <h6 class="mb-0">{{ assignedUnit.name }}</h6>
                <small class="text-muted">{{ assignedUnit.type }}</small>
                <div class="mt-1">
                  <span class="badge" :class="`bg-${getUnitStatusVariant(assignedUnit.status)}`">
                    {{ formatUnitStatus(assignedUnit.status) }}
                  </span>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-3">
              <p class="text-muted mb-2">No unit assigned</p>
              <button 
                class="btn btn-sm btn-outline-primary"
                @click="showAssignUnitModal = true"
              >
                <i class="fas fa-plus me-1"></i> Assign Unit
              </button>
            </div>
          </div>
        </div>
        
        <!-- Quick actions -->
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Quick Actions</h5>
          </div>
          <div class="card-body">
            <div class="d-grid gap-2">
              <button 
                v-if="incident.status !== 'resolved'"
                class="btn btn-outline-success text-start"
                @click="resolveIncident"
              >
                <i class="fas fa-check-circle me-2"></i> Mark as Resolved
              </button>
              
              <button 
                v-if="incident.status !== 'cancelled'"
                class="btn btn-outline-danger text-start"
                @click="cancelIncident"
              >
                <i class="fas fa-times-circle me-2"></i> Cancel Incident
              </button>
              
              <button 
                class="btn btn-outline-secondary text-start"
                @click="printIncident"
              >
                <i class="fas fa-print me-2"></i> Print Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Assign Unit Modal -->
    <div class="modal fade" :class="{ 'show d-block': showAssignUnitModal }" tabindex="-1" v-if="showAssignUnitModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Assign Unit</h5>
            <button type="button" class="btn-close" @click="showAssignUnitModal = false"></button>
          </div>
          <div class="modal-body">
            <div v-if="loadingUnits" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2">Loading available units...</p>
            </div>
            <div v-else>
              <div class="mb-3">
                <label class="form-label">Select Unit</label>
                <select class="form-select" v-model="selectedUnitId">
                  <option value="" disabled>Select a unit</option>
                  <option 
                    v-for="unit in availableUnits" 
                    :key="unit.id" 
                    :value="unit.id"
                  >
                    {{ unit.name }} ({{ unit.type }})
                  </option>
                </select>
              </div>
              <div v-if="selectedUnit" class="alert alert-info">
                <h6>{{ selectedUnit.name }}</h6>
                <p class="mb-1">Type: {{ selectedUnit.type }}</p>
                <p class="mb-0">Status: {{ formatUnitStatus(selectedUnit.status) }}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="showAssignUnitModal = false">
              Cancel
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="assignUnit"
              :disabled="!selectedUnitId || assigningUnit"
            >
              <span v-if="assigningUnit" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              {{ assigningUnit ? 'Assigning...' : 'Assign Unit' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { createSupabase } from '../../supabase';

export default {
  name: 'IncidentDetails',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();
    const supabase = createSupabase();
    
    // State
    const loading = ref(true);
    const loadingUnits = ref(false);
    const assigningUnit = ref(false);
    const incident = ref(null);
    const activities = ref([]);
    const availableUnits = ref([]);
    const selectedUnitId = ref('');
    const showAssignUnitModal = ref(false);
    const newStatus = ref('');
    
    // Computed
    const assignedUnit = computed(() => {
      return availableUnits.value.find(u => u.assigned_incident_id === incident.value?.id);
    });
    
    const selectedUnit = computed(() => {
      return availableUnits.value.find(u => u.id === selectedUnitId.value);
    });
    
    // Methods
    const fetchIncident = async () => {
      try {
        const { data, error } = await supabase
          .from('incidents')
          .select('*')
          .eq('id', props.id)
          .single();
          
        if (error) throw error;
        
        incident.value = data;
        newStatus.value = data.status;
        
        // Fetch activities
        await fetchActivities();
        
        // Fetch available units
        await fetchAvailableUnits();
        
      } catch (error) {
        console.error('Error fetching incident:', error);
      } finally {
        loading.value = false;
      }
    };
    
    const fetchActivities = async () => {
      // In a real app, fetch from your API
      activities.value = [
        {
          type: 'created',
          title: 'Incident Created',
          description: incident.value.description || 'No description provided',
          timestamp: incident.value.created_at,
          user: incident.value.reported_by || 'System'
        },
        {
          type: 'status',
          title: `Status changed to ${formatStatus(incident.value.status)}`,
          description: 'Initial status',
          timestamp: incident.value.updated_at || incident.value.created_at,
          user: 'System'
        }
      ];
    };
    
    const fetchAvailableUnits = async () => {
      loadingUnits.value = true;
      try {
        // In a real app, fetch from your API
        // This is mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        availableUnits.value = [
          { 
            id: 'unit-1', 
            name: 'Medical Team Alpha', 
            type: 'Medical', 
            status: 'available',
            assigned_incident_id: null
          },
          { 
            id: 'unit-2', 
            name: 'Security Team Bravo', 
            type: 'Security', 
            status: 'available',
            assigned_incident_id: incident.value.id
          },
          { 
            id: 'unit-3', 
            name: 'First Responder Charlie', 
            type: 'Medical', 
            status: 'on_call',
            assigned_incident_id: null
          },
        ];
        
        // Set the selected unit if one is already assigned
        const assigned = availableUnits.value.find(u => u.assigned_incident_id === incident.value.id);
        if (assigned) {
          selectedUnitId.value = assigned.id;
        }
        
      } catch (error) {
        console.error('Error fetching units:', error);
      } finally {
        loadingUnits.value = false;
      }
    };
    
    const assignUnit = async () => {
      if (!selectedUnitId.value) return;
      
      assigningUnit.value = true;
      
      try {
        // In a real app, make an API call to assign the unit
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Update local state
        availableUnits.value = availableUnits.value.map(unit => ({
          ...unit,
          assigned_incident_id: unit.id === selectedUnitId.value ? incident.value.id : null
        }));
        
        // Add to activity log
        const unit = availableUnits.value.find(u => u.id === selectedUnitId.value);
        activities.value.unshift({
          type: 'assignment',
          title: 'Unit Assigned',
          description: `${unit.name} (${unit.type}) has been assigned to this incident`,
          timestamp: new Date().toISOString(),
          user: 'Current User' // In a real app, use the logged-in user's name
        });
        
        showAssignUnitModal.value = false;
        
      } catch (error) {
        console.error('Error assigning unit:', error);
      } finally {
        assigningUnit.value = false;
      }
    };
    
    const updateStatus = async () => {
      if (!newStatus.value || newStatus.value === incident.value.status) return;
      
      try {
        // In a real app, make an API call to update the status
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const oldStatus = incident.value.status;
        incident.value.status = newStatus.value;
        incident.value.updated_at = new Date().toISOString();
        
        // Add to activity log
        activities.value.unshift({
          type: 'status',
          title: 'Status Updated',
          description: `Status changed from ${formatStatus(oldStatus)} to ${formatStatus(newStatus.value)}`,
          timestamp: new Date().toISOString(),
          user: 'Current User' // In a real app, use the logged-in user's name
        });
        
      } catch (error) {
        console.error('Error updating status:', error);
      }
    };
    
    const resolveIncident = () => {
      newStatus.value = 'resolved';
      updateStatus();
    };
    
    const cancelIncident = () => {
      if (confirm('Are you sure you want to cancel this incident? This action cannot be undone.')) {
        newStatus.value = 'cancelled';
        updateStatus();
      }
    };
    
    const printIncident = () => {
      window.print();
    };
    
    // Formatting helpers
    const formatDateTime = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleString();
    };
    
    const formatTimeAgo = (dateString) => {
      if (!dateString) return '';
      
      const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
      
      let interval = Math.floor(seconds / 31536000);
      if (interval >= 1) return `${interval} year${interval === 1 ? '' : 's'} ago`;
      
      interval = Math.floor(seconds / 2592000);
      if (interval >= 1) return `${interval} month${interval === 1 ? '' : 's'} ago`;
      
      interval = Math.floor(seconds / 86400);
      if (interval >= 1) return `${interval} day${interval === 1 ? '' : 's'} ago`;
      
      interval = Math.floor(seconds / 3600);
      if (interval >= 1) return `${interval} hour${interval === 1 ? '' : 's'} ago`;
      
      interval = Math.floor(seconds / 60);
      if (interval >= 1) return `${interval} minute${interval === 1 ? '' : 's'} ago`;
      
      return 'Just now';
    };
    
    const formatIncidentType = (type) => {
      if (!type) return 'Unknown';
      return type.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    };
    
    const formatStatus = (status) => {
      if (!status) return 'Unknown';
      return status.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    };
    
    const formatPriority = (priority) => {
      return priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'N/A';
    };
    
    const formatUnitStatus = (status) => {
      const statusMap = {
        available: 'Available',
        on_call: 'On Call',
        assigned: 'Assigned',
        unavailable: 'Unavailable'
      };
      return statusMap[status] || status;
    };
    
    const getInitials = (name) => {
      if (!name) return '??';
      return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    };
    
    const getIncidentTypeVariant = (type) => {
      const variants = {
        medical_emergency: 'danger',
        injury: 'warning',
        security_breach: 'danger',
        disturbance: 'warning',
        other: 'secondary'
      };
      return variants[type] || 'secondary';
    };
    
    const getStatusVariant = (status) => {
      const variants = {
        reported: 'primary',
        in_progress: 'info',
        resolved: 'success',
        cancelled: 'secondary',
        closed: 'dark'
      };
      return variants[status] || 'light';
    };
    
    const getPriorityVariant = (priority) => {
      const variants = {
        high: 'danger',
        medium: 'warning',
        low: 'info'
      };
      return variants[priority] || 'secondary';
    };
    
    const getUnitStatusVariant = (status) => {
      const variants = {
        available: 'success',
        on_call: 'info',
        assigned: 'primary',
        unavailable: 'secondary'
      };
      return variants[status] || 'light';
    };
    
    const getActivityIcon = (type) => {
      const icons = {
        created: 'fas fa-plus-circle text-primary',
        status: 'fas fa-sync-alt text-info',
        assignment: 'fas fa-user-plus text-success',
        note: 'fas fa-sticky-note text-warning',
        default: 'fas fa-circle text-muted'
      };
      return icons[type] || icons.default;
    };
    
    // Lifecycle hooks
    onMounted(() => {
      fetchIncident();
    });
    
    return {
      // State
      loading,
      loadingUnits,
      assigningUnit,
      incident,
      activities,
      availableUnits,
      selectedUnitId,
      showAssignUnitModal,
      newStatus,
      
      // Computed
      assignedUnit,
      selectedUnit,
      
      // Methods
      assignUnit,
      updateStatus,
      resolveIncident,
      cancelIncident,
      printIncident,
      
      // Formatting helpers
      formatDateTime,
      formatTimeAgo,
      formatIncidentType,
      formatStatus,
      formatPriority,
      formatUnitStatus,
      getInitials,
      getIncidentTypeVariant,
      getStatusVariant,
      getPriorityVariant,
      getUnitStatusVariant,
      getActivityIcon
    };
  }
};
</script>

<style scoped>
/* Timeline styles */
.timeline {
  position: relative;
  padding-left: 1.5rem;
}

.timeline::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0.5rem;
  width: 2px;
  background-color: #e9ecef;
}

.timeline-item {
  position: relative;
  padding-bottom: 1.5rem;
  padding-left: 1.5rem;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-badge {
  position: absolute;
  left: -1.5rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border: 2px solid #e9ecef;
  z-index: 1;
}

.timeline-content {
  background-color: #f8f9fa;
  border-radius: 0.375rem;
  padding: 1rem;
  position: relative;
  margin-bottom: 1rem;
}

.timeline-content::before {
  content: '';
  position: absolute;
  top: 1rem;
  left: -0.5rem;
  width: 0;
  height: 0;
  border-top: 0.5rem solid transparent;
  border-bottom: 0.5rem solid transparent;
  border-right: 0.5rem solid #f8f9fa;
}

/* Avatar */
.avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e9ecef;
  font-weight: 600;
}

.avatar-text {
  font-size: 1rem;
  line-height: 1;
}

/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }
  
  .card {
    border: none !important;
    box-shadow: none !important;
  }
  
  .timeline::before {
    display: none;
  }
  
  .timeline-badge {
    display: none;
  }
  
  .timeline-content {
    border: 1px solid #dee2e6;
    margin-left: 0;
    padding-left: 1rem;
  }
  
  .timeline-content::before {
    display: none;
  }
}
</style>
