<template>
  <div class="incident-form">
    <!-- Form content will go here -->
    <div class="card">
      <div class="card-header bg-primary text-white">
        <h2 class="h5 mb-0">
          <i class="fas fa-exclamation-triangle me-2"></i>
          Report New Incident
        </h2>
      </div>
      <div class="card-body">
        <!-- Progress Bar -->
        <div class="mb-4">
          <div class="d-flex justify-content-between align-items-center">
            <template v-for="step in 4" :key="step">
              <div class="step-container">
                <div 
                  class="step" 
                  :class="{ 
                    'active': currentStep >= step,
                    'completed': currentStep > step
                  }"
                  @click="goToStep(step)"
                >
                  <span class="step-number">{{ step }}</span>
                  <span class="step-label d-none d-md-inline">
                    {{ getStepLabel(step) }}
                  </span>
                </div>
                <div v-if="step < 4" class="step-connector"></div>
              </div>
            </template>
          </div>
          <div class="progress mt-2" style="height: 6px;">
            <div 
              class="progress-bar bg-primary" 
              role="progressbar" 
              :style="{ width: progress }"
              :aria-valuenow="(currentStep / 4) * 100"
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
        </div>

        <!-- Form Steps -->
        <form @submit.prevent="handleSubmit">
          <!-- Step 1: Basic Information -->
          <div v-if="currentStep === 1" class="step-content">
            <h4 class="mb-4">Basic Information</h4>
            
            <div class="mb-3">
              <label for="incidentType" class="form-label">Incident Type</label>
              <select class="form-select" id="incidentType" v-model="formData.type">
                <option value="medical">Medical Emergency</option>
                <option value="security">Security Incident</option>
                <option value="fire">Fire</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div class="mb-3">
              <label for="title" class="form-label">Title</label>
              <input type="text" class="form-control" id="title" v-model="formData.title" required>
            </div>
            
            <div class="mb-3">
              <label for="description" class="form-label">Description</label>
              <textarea class="form-control" id="description" v-model="formData.description" rows="3" required></textarea>
            </div>
          </div>

          <!-- Step 2: Location -->
          <div v-else-if="currentStep === 2" class="step-content">
            <h4 class="mb-4">Location</h4>
            
            <div class="mb-3">
              <label for="location" class="form-label">Location</label>
              <input type="text" class="form-control" id="location" v-model="formData.location" required>
            </div>
            
            <div class="map-container bg-light" style="height: 300px; border-radius: 0.25rem;">
              <!-- Map will be rendered here -->
              <div class="h-100 d-flex align-items-center justify-content-center">
                <div class="text-center">
                  <i class="fas fa-map-marker-alt fa-3x text-muted mb-2"></i>
                  <p class="mb-0">Map will be displayed here</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Resources -->
          <div v-else-if="currentStep === 3" class="step-content">
            <h4 class="mb-4">Resources</h4>
            
            <div class="mb-3">
              <label class="form-label">Assign Resources</label>
              <div class="list-group">
                <div 
                  v-for="resource in availableResources" 
                  :key="resource.id"
                  class="list-group-item list-group-item-action"
                  :class="{ 'active': formData.assignedResources.includes(resource.id) }"
                  @click="toggleResource(resource.id)"
                >
                  <div class="d-flex align-items-center">
                    <div class="form-check
                      <input 
                        type="checkbox" 
                        class="form-check-input me-2"
                        :checked="formData.assignedResources.includes(resource.id)"
                        @click.stop
                      >
                    </div>
                    <div>
                      <h6 class="mb-0">{{ resource.name }}</h6>
                      <small class="text-muted">{{ resource.type }}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 4: Review -->
          <div v-else class="step-content">
            <h4 class="mb-4">Review & Submit</h4>
            
            <div class="card mb-4">
              <div class="card-body">
                <h5>Incident Details</h5>
                <table class="table">
                  <tbody>
                    <tr>
                      <th>Type:</th>
                      <td>{{ formatIncidentType(formData.type) }}</td>
                    </tr>
                    <tr>
                      <th>Title:</th>
                      <td>{{ formData.title }}</td>
                    </tr>
                    <tr>
                      <th>Description:</th>
                      <td>{{ formData.description }}</td>
                    </tr>
                    <tr>
                      <th>Location:</th>
                      <td>{{ formData.location || 'Not specified' }}</td>
                    </tr>
                    <tr v-if="formData.assignedResources.length > 0">
                      <th>Assigned Resources:</th>
                      <td>
                        <ul class="list-unstyled mb-0">
                          <li v-for="resourceId in formData.assignedResources" :key="resourceId">
                            {{ getResourceName(resourceId) }}
                          </li>
                        </ul>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div class="form-check mb-4">
              <input 
                class="form-check-input" 
                type="checkbox" 
                id="confirmDetails" 
                v-model="confirmedDetails"
                required
              >
              <label class="form-check-label" for="confirmDetails">
                I confirm that all information is correct
              </label>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="d-flex justify-content-between mt-4">
            <button 
              v-if="currentStep > 1"
              type="button" 
              class="btn btn-outline-secondary"
              @click="previousStep"
              :disabled="loading"
            >
              <i class="fas fa-arrow-left me-2"></i> Back
            </button>
            <div v-else></div>
            
            <div>
              <button 
                v-if="currentStep < 4"
                type="button" 
                class="btn btn-primary"
                @click="nextStep"
                :disabled="!canProceedToNextStep || loading"
              >
                Continue to {{ getNextStepName() }} <i class="fas fa-arrow-right ms-2"></i>
              </button>
              
              <button 
                v-else
                type="submit" 
                class="btn btn-success"
                :disabled="!confirmedDetails || loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                {{ loading ? 'Submitting...' : 'Submit Incident' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { required, email, minLength, maxLength } from '@vuelidate/validators';
import { createIncident } from '../supabase';

export default {
  name: 'IncidentForm',
  setup() {
    const router = useRouter();
    
    // Form state
    const currentStep = ref(1);
    const loading = ref(false);
    const confirmedDetails = ref(false);
    
    // Form data
    const formData = ref({
      type: 'medical',
      title: '',
      description: '',
      location: '',
      assignedResources: [],
      status: 'new',
      priority: 'medium',
      reportedBy: null, // Will be set to current user
      reportedAt: new Date().toISOString()
    });
    
    // Available resources (mocked data)
    const availableResources = ref([
      { id: 'medic-1', name: 'Medical Team Alpha', type: 'medical' },
      { id: 'security-1', name: 'Security Team Bravo', type: 'security' },
      { id: 'fire-1', name: 'Fire Team Charlie', type: 'fire' },
      { id: 'first-responder-1', name: 'First Responder Delta', type: 'first_responder' }
    ]);
    
    // Computed properties
    const progress = computed(() => {
      return `${(currentStep.value / 4) * 100}%`;
    });
    
    const canProceedToNextStep = computed(() => {
      // Basic validation for each step
      switch (currentStep.value) {
        case 1:
          return formData.value.title && formData.value.description;
        case 2:
          return formData.value.location;
        default:
          return true;
      }
    });
    
    // Methods
    const nextStep = () => {
      if (canProceedToNextStep.value) {
        currentStep.value++;
      }
    };
    
    const previousStep = () => {
      currentStep.value--;
    };
    
    const goToStep = (step) => {
      if (step < currentStep.value) {
        currentStep.value = step;
      }
    };
    
    const getStepLabel = (step) => {
      const labels = {
        1: 'Basic Info',
        2: 'Location',
        3: 'Resources',
        4: 'Review'
      };
      return labels[step] || '';
    };
    
    const getNextStepName = () => {
      const nextStep = currentStep.value + 1;
      return getStepLabel(nextStep);
    };
    
    const toggleResource = (resourceId) => {
      const index = formData.value.assignedResources.indexOf(resourceId);
      if (index === -1) {
        formData.value.assignedResources.push(resourceId);
      } else {
        formData.value.assignedResources.splice(index, 1);
      }
    };
    
    const getResourceName = (resourceId) => {
      const resource = availableResources.value.find(r => r.id === resourceId);
      return resource ? resource.name : resourceId;
    };
    
    const formatIncidentType = (type) => {
      const types = {
        medical: 'Medical Emergency',
        security: 'Security Incident',
        fire: 'Fire',
        other: 'Other'
      };
      return types[type] || type;
    };
    
    const handleSubmit = async () => {
      if (!confirmedDetails.value) return;
      
      loading.value = true;
      
      try {
        // Set reported by to current user (you'll need to implement auth)
        // formData.value.reportedBy = currentUser.value?.id || 'anonymous';
        
        // Create incident in Supabase
        const { data, error } = await createIncident(formData.value);
        
        if (error) throw error;
        
        // Redirect to incident details or dashboard
        router.push({ name: 'incident-details', params: { id: data[0].id } });
        
      } catch (error) {
        console.error('Error submitting incident:', error);
        // Show error message to user
        alert('Failed to submit incident. Please try again.');
      } finally {
        loading.value = false;
      }
    };
    
    // Lifecycle hooks
    onMounted(() => {
      // Initialize map or other setup here
    });
    
    return {
      // State
      currentStep,
      loading,
      confirmedDetails,
      formData,
      availableResources,
      
      // Computed
      progress,
      canProceedToNextStep,
      
      // Methods
      nextStep,
      previousStep,
      goToStep,
      getStepLabel,
      getNextStepName,
      toggleResource,
      getResourceName,
      formatIncidentType,
      handleSubmit
    };
  }
};
</script>

<style scoped>
.step-container {
  display: flex;
  align-items: center;
  flex: 1;
  position: relative;
}

.step {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e9ecef;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.step.active {
  background-color: #0d6efd;
  color: white;
}

.step.completed {
  background-color: #198754;
  color: white;
}

.step-connector {
  flex: 1;
  height: 2px;
  background-color: #e9ecef;
  margin: 0 10px;
}

.step-content {
  min-height: 300px;
  padding: 20px 0;
}

.list-group-item {
  cursor: pointer;
  transition: all 0.2s;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

.list-group-item.active {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.map-container {
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  overflow: hidden;
}
</style>
