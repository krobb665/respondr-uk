<template>
  <div class="notifications-settings">
    <h3 class="h5 mb-4">
      <i class="fas fa-bell me-2"></i>Notification Preferences
    </h3>
    
    <!-- Email Notifications -->
    <div class="card mb-4">
      <div class="card-header bg-light">
        <h4 class="h6 mb-0">Email Notifications</h4>
      </div>
      <div class="card-body">
        <div class="mb-3">
          <div class="form-check form-switch mb-3">
            <input 
              class="form-check-input" 
              type="checkbox" 
              id="emailNotifications"
              v-model="emailNotifications.enabled"
              :disabled="saving"
            >
            <label class="form-check-label" for="emailNotifications">
              <strong>Enable email notifications</strong>
              <p class="small text-muted mb-0">
                Receive important updates and alerts via email
              </p>
            </label>
          </div>
          
          <div v-if="emailNotifications.enabled" class="ms-4">
            <div class="form-check mb-2">
              <input 
                class="form-check-input" 
                type="checkbox" 
                id="emailIncidentAlerts"
                v-model="emailNotifications.incidentAlerts"
                :disabled="saving"
              >
              <label class="form-check-label" for="emailIncidentAlerts">
                Incident alerts
              </label>
            </div>
            <div class="form-check mb-2">
              <input 
                class="form-check-input" 
                type="checkbox" 
                id="emailStatusUpdates"
                v-model="emailNotifications.statusUpdates"
                :disabled="saving"
              >
              <label class="form-check-label" for="emailStatusUpdates">
                Status updates
              </label>
            </div>
            <div class="form-check mb-2">
              <input 
                class="form-check-input" 
                type="checkbox" 
                id="emailWeeklyDigest"
                v-model="emailNotifications.weeklyDigest"
                :disabled="saving"
              >
              <label class="form-check-label" for="emailWeeklyDigest">
                Weekly digest
              </label>
            </div>
            <div class="form-check">
              <input 
                class="form-check-input" 
                type="checkbox" 
                id="emailPromotions"
                v-model="emailNotifications.promotions"
                :disabled="saving"
              >
              <label class="form-check-label" for="emailPromotions">
                Promotions and offers
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Push Notifications -->
    <div class="card mb-4">
      <div class="card-header bg-light">
        <h4 class="h6 mb-0">Push Notifications</h4>
      </div>
      <div class="card-body">
        <div class="mb-3">
          <div class="form-check form-switch mb-3">
            <input 
              class="form-check-input" 
              type="checkbox" 
              id="pushNotifications"
              v-model="pushNotifications.enabled"
              :disabled="saving || !isPushSupported"
            >
            <label class="form-check-label" for="pushNotifications">
              <strong>Enable push notifications</strong>
              <p v-if="!isPushSupported" class="small text-warning mb-0">
                Push notifications are not supported in your browser or have been blocked.
              </p>
              <p v-else class="small text-muted mb-0">
                Receive real-time updates on your device
              </p>
            </label>
          </div>
          
          <div v-if="pushNotifications.enabled && isPushSupported" class="ms-4">
            <div class="form-check mb-2">
              <input 
                class="form-check-input" 
                type="checkbox" 
                id="pushIncidentAlerts"
                v-model="pushNotifications.incidentAlerts"
                :disabled="saving"
              >
              <label class="form-check-label" for="pushIncidentAlerts">
                Incident alerts
              </label>
            </div>
            <div class="form-check mb-2">
              <input 
                class="form-check-input" 
                type="checkbox" 
                id="pushUrgentOnly"
                v-model="pushNotifications.urgentOnly"
                :disabled="saving"
              >
              <label class="form-check-label" for="pushUrgentOnly">
                Urgent alerts only
              </label>
            </div>
            <div class="form-check">
              <input 
                class="form-check-input" 
                type="checkbox" 
                id="pushSound"
                v-model="pushNotifications.sound"
                :disabled="saving"
              >
              <label class="form-check-label" for="pushSound">
                Play sound for notifications
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- SMS Notifications -->
    <div class="card mb-4">
      <div class="card-header bg-light">
        <h4 class="h6 mb-0">SMS Notifications</h4>
      </div>
      <div class="card-body">
        <div class="alert alert-info mb-4">
          <i class="fas fa-info-circle me-2"></i>
          SMS notifications are only sent for critical alerts and cannot be disabled.
        </div>
        
        <div class="mb-3">
          <label for="phoneNumber" class="form-label">Phone Number</label>
          <div class="input-group">
            <input 
              type="tel" 
              class="form-control" 
              id="phoneNumber"
              v-model="phoneNumber"
              placeholder="+44 1234 567890"
              :disabled="saving"
            >
            <button 
              class="btn btn-outline-secondary" 
              type="button"
              @click="verifyPhoneNumber"
              :disabled="saving || !phoneNumber"
            >
              <span v-if="verifyingPhone" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              {{ verifyingPhone ? 'Sending...' : 'Verify' }}
            </button>
          </div>
          <div v-if="phoneVerified" class="text-success small mt-1">
            <i class="fas fa-check-circle me-1"></i> Phone number verified
          </div>
          <div class="form-text">
            We'll send a verification code to confirm your phone number
          </div>
        </div>
      </div>
    </div>
    
    <!-- Notification Schedule -->
    <div class="card">
      <div class="card-header bg-light">
        <h4 class="h6 mb-0">Notification Schedule</h4>
      </div>
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Do Not Disturb</label>
            <div class="form-check form-switch mb-3">
              <input 
                class="form-check-input" 
                type="checkbox" 
                id="doNotDisturb"
                v-model="doNotDisturb.enabled"
                :disabled="saving"
              >
              <label class="form-check-label" for="doNotDisturb">
                Enable Do Not Disturb
              </label>
            </div>
            
            <div v-if="doNotDisturb.enabled" class="ms-4">
              <div class="row g-2">
                <div class="col-6">
                  <label for="dndStart" class="form-label small">From</label>
                  <input 
                    type="time" 
                    class="form-control form-control-sm" 
                    id="dndStart"
                    v-model="doNotDisturb.startTime"
                    :disabled="saving"
                  >
                </div>
                <div class="col-6">
                  <label for="dndEnd" class="form-label small">To</label>
                  <input 
                    type="time" 
                    class="form-control form-control-sm" 
                    id="dndEnd"
                    v-model="doNotDisturb.endTime"
                    :disabled="saving"
                  >
                </div>
              </div>
              <div class="form-text small">
                During these hours, you'll only receive high-priority notifications
              </div>
            </div>
          </div>
          
          <div class="col-md-6">
            <label class="form-label">Days Active</label>
            <div class="d-flex flex-wrap gap-2">
              <button 
                v-for="day in daysOfWeek" 
                :key="day.value"
                type="button" 
                class="btn btn-sm"
                :class="{
                  'btn-primary': doNotDisturb.days.includes(day.value),
                  'btn-outline-secondary': !doNotDisturb.days.includes(day.value)
                }"
                @click="toggleDay(day.value)"
                :disabled="saving || !doNotDisturb.enabled"
              >
                {{ day.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Save Button -->
    <div class="d-flex justify-content-end mt-4">
      <button 
        class="btn btn-primary"
        @click="saveSettings"
        :disabled="saving || !hasChanges"
      >
        <span v-if="saving" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        {{ saving ? 'Saving...' : 'Save Changes' }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

export default {
  name: 'NotificationSettings',
  setup() {
    // Check if push notifications are supported
    const isPushSupported = ref('Notification' in window);
    
    // Form state
    const saving = ref(false);
    const verifyingPhone = ref(false);
    const phoneVerified = ref(false);
    const phoneNumber = ref('+44 1234 567890');
    
    // Notification settings
    const emailNotifications = ref({
      enabled: true,
      incidentAlerts: true,
      statusUpdates: true,
      weeklyDigest: true,
      promotions: false
    });
    
    const pushNotifications = ref({
      enabled: false,
      incidentAlerts: true,
      urgentOnly: false,
      sound: true
    });
    
    const doNotDisturb = ref({
      enabled: false,
      startTime: '22:00',
      endTime: '07:00',
      days: [0, 6] // Sunday, Saturday
    });
    
    // Days of the week
    const daysOfWeek = [
      { value: 0, label: 'Sun' },
      { value: 1, label: 'Mon' },
      { value: 2, label: 'Tue' },
      { value: 3, label: 'Wed' },
      { value: 4, label: 'Thu' },
      { value: 5, label: 'Fri' },
      { value: 6, label: 'Sat' }
    ];
    
    // Original settings for comparison
    let originalSettings = null;
    
    // Check if there are unsaved changes
    const hasChanges = computed(() => {
      if (!originalSettings) return false;
      
      return (
        JSON.stringify(emailNotifications.value) !== JSON.stringify(originalSettings.emailNotifications) ||
        JSON.stringify(pushNotifications.value) !== JSON.stringify(originalSettings.pushNotifications) ||
        JSON.stringify(doNotDisturb.value) !== JSON.stringify(originalSettings.doNotDisturb) ||
        phoneNumber.value !== originalSettings.phoneNumber
      );
    });
    
    // Toggle day in Do Not Disturb days array
    const toggleDay = (day) => {
      const index = doNotDisturb.value.days.indexOf(day);
      if (index === -1) {
        doNotDisturb.value.days.push(day);
      } else {
        doNotDisturb.value.days.splice(index, 1);
      }
      // Sort the days
      doNotDisturb.value.days.sort((a, b) => a - b);
    };
    
    // Verify phone number
    const verifyPhoneNumber = async () => {
      if (!phoneNumber.value) return;
      
      try {
        verifyingPhone.value = true;
        
        // In a real app, you would send a verification code to the phone
        // await fetch('/api/verify-phone', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ phone: phoneNumber.value })
        // });
        
        // Mock success after delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        phoneVerified.value = true;
        if (window.showToast) {
          window.showToast('Verification code sent to your phone', 'success');
        }
      } catch (error) {
        console.error('Failed to send verification code:', error);
        if (window.showToast) {
          window.showToast('Failed to send verification code', 'danger');
        }
      } finally {
        verifyingPhone.value = false;
      }
    };
    
    // Save notification settings
    const saveSettings = async () => {
      try {
        saving.value = true;
        
        // In a real app, you would save these settings to your backend
        // await fetch('/api/notifications/settings', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     email: emailNotifications.value,
        //     push: pushNotifications.value,
        //     doNotDisturb: doNotDisturb.value,
        //     phoneNumber: phoneNumber.value
        //   })
        // });
        
        // Mock success after delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update original settings
        originalSettings = {
          emailNotifications: { ...emailNotifications.value },
          pushNotifications: { ...pushNotifications.value },
          doNotDisturb: { ...doNotDisturb.value },
          phoneNumber: phoneNumber.value
        };
        
        if (window.showToast) {
          window.showToast('Notification settings saved successfully', 'success');
        }
      } catch (error) {
        console.error('Failed to save settings:', error);
        if (window.showToast) {
          window.showToast('Failed to save notification settings', 'danger');
        }
      } finally {
        saving.value = false;
      }
    };
    
    // Load notification settings
    const loadSettings = async () => {
      try {
        saving.value = true;
        
        // In a real app, you would fetch these settings from your backend
        // const response = await fetch('/api/notifications/settings');
        // const data = await response.json();
        
        // Mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockData = {
          email: {
            enabled: true,
            incidentAlerts: true,
            statusUpdates: true,
            weeklyDigest: true,
            promotions: false
          },
          push: {
            enabled: false,
            incidentAlerts: true,
            urgentOnly: false,
            sound: true
          },
          doNotDisturb: {
            enabled: false,
            startTime: '22:00',
            endTime: '07:00',
            days: [0, 6]
          },
          phoneNumber: '+44 1234 567890',
          phoneVerified: true
        };
        
        emailNotifications.value = { ...mockData.email };
        pushNotifications.value = { ...mockData.push };
        doNotDisturb.value = { ...mockData.doNotDisturb };
        phoneNumber.value = mockData.phoneNumber;
        phoneVerified.value = mockData.phoneVerified;
        
        // Save original settings for comparison
        originalSettings = {
          emailNotifications: { ...mockData.email },
          pushNotifications: { ...mockData.push },
          doNotDisturb: { ...mockData.doNotDisturb },
          phoneNumber: mockData.phoneNumber
        };
      } catch (error) {
        console.error('Failed to load notification settings:', error);
        if (window.showToast) {
          window.showToast('Failed to load notification settings', 'danger');
        }
      } finally {
        saving.value = false;
      }
    };
    
    // Request push notification permission if supported
    const requestPushPermission = () => {
      if (!isPushSupported.value) return;
      
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          pushNotifications.value.enabled = true;
          if (window.showToast) {
            window.showToast('Push notifications enabled', 'success');
          }
        } else {
          pushNotifications.value.enabled = false;
        }
      }).catch(error => {
        console.error('Error requesting notification permission:', error);
        pushNotifications.value.enabled = false;
      });
    };
    
    // Load settings when component mounts
    onMounted(() => {
      loadSettings();
      
      // Check push notification permission
      if (isPushSupported.value && Notification.permission === 'granted') {
        pushNotifications.value.enabled = true;
      } else if (isPushSupported.value && Notification.permission !== 'denied') {
        // Optionally request permission on page load
        // requestPushPermission();
      }
    });
    
    return {
      // State
      saving,
      verifyingPhone,
      phoneVerified,
      phoneNumber,
      emailNotifications,
      pushNotifications,
      doNotDisturb,
      daysOfWeek,
      isPushSupported,
      
      // Computed
      hasChanges,
      
      // Methods
      toggleDay,
      verifyPhoneNumber,
      saveSettings,
      requestPushPermission
    };
  }
};
</script>

<style scoped>
.notifications-settings {
  max-width: 100%;
  overflow-x: hidden;
}

.form-switch .form-check-input {
  width: 2.5em;
  margin-left: -2.5em;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='rgba%280, 0, 0, 0.25%29'/%3e%3c/svg%3e");
  background-position: left center;
  border-radius: 2em;
  transition: background-position 0.15s ease-in-out;
}

.form-switch .form-check-input:checked {
  background-position: right center;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%23fff'/%3e%3c/svg%3e");
}

.form-check-input:checked {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 0.2rem;
}

.btn-outline-secondary {
  color: #6c757d;
  border-color: #dee2e6;
}

.btn-outline-secondary:hover {
  background-color: #f8f9fa;
  border-color: #dee2e6;
  color: #6c757d;
}

/* Responsive adjustments */
@media (max-width: 767.98px) {
  .btn {
    width: 100%;
    margin-top: 0.5rem;
  }
  
  .input-group {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .input-group > .form-control,
  .input-group > .btn {
    width: 100%;
    border-radius: 0.25rem;
  }
  
  .input-group > .btn {
    margin-left: 0;
  }
}
</style>
