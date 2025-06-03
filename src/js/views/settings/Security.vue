<template>
  <div class="security-settings">
    <h3 class="h5 mb-4">
      <i class="fas fa-shield-alt me-2"></i>Security Settings
    </h3>
    
    <!-- Two-Factor Authentication -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="d-flex align-items-center mb-3">
          <div class="me-3">
            <i class="fas fa-mobile-alt fa-2x text-primary"></i>
          </div>
          <div class="flex-grow-1">
            <h4 class="h6 mb-1">Two-Factor Authentication</h4>
            <p class="text-muted small mb-0">
              {{ twoFactorEnabled ? 'Enabled' : 'Add an extra layer of security' }}
            </p>
          </div>
          <button 
            class="btn"
            :class="twoFactorEnabled ? 'btn-outline-danger' : 'btn-outline-primary'"
            @click="twoFactorEnabled ? disableTwoFactor() : showTwoFactorSetup = true"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            {{ twoFactorEnabled ? 'Disable' : 'Enable' }}
          </button>
        </div>
        
        <!-- Two-Factor Setup -->
        <div v-if="showTwoFactorSetup" class="mt-4 p-3 bg-light rounded">
          <h5 class="h6 mb-3">Set up Authenticator</h5>
          <ol class="small">
            <li class="mb-2">
              Install an authenticator app like Google Authenticator or Authy on your device.
            </li>
            <li class="mb-2">
              Scan the QR code with your authenticator app:
              <div class="text-center my-3">
                <div class="d-inline-block p-2 bg-white rounded">
                  <img 
                    :src="qrCodeUrl" 
                    alt="QR Code" 
                    class="img-fluid" 
                    style="max-width: 150px;"
                  >
                </div>
              </div>
            </li>
            <li class="mb-2">
              Or enter this code manually: 
              <code class="ms-1">{{ twoFactorSecret }}</code>
            </li>
            <li class="mb-3">
              Enter the 6-digit code from your authenticator app:
              <div class="row g-2 mt-2">
                <div class="col-4">
                  <input 
                    type="text" 
                    class="form-control form-control-lg text-center" 
                    maxlength="6"
                    v-model="twoFactorCode"
                    placeholder="123456"
                    :disabled="verifying"
                  >
                </div>
              </div>
              <div v-if="verificationError" class="text-danger small mt-2">
                {{ verificationError }}
              </div>
            </li>
          </ol>
          <div class="d-flex justify-content-end">
            <button 
              class="btn btn-outline-secondary btn-sm me-2" 
              @click="cancelTwoFactorSetup"
              :disabled="verifying"
            >
              Cancel
            </button>
            <button 
              class="btn btn-primary btn-sm"
              @click="verifyTwoFactor"
              :disabled="!twoFactorCode || twoFactorCode.length !== 6 || verifying"
            >
              <span v-if="verifying" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              Verify & Enable
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Active Sessions -->
    <div class="card">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="h6 mb-0">Active Sessions</h4>
          <button 
            class="btn btn-sm btn-outline-danger"
            @click="revokeAllSessions"
            :disabled="activeSessions.length === 0"
          >
            <i class="fas fa-sign-out-alt me-1"></i>Log Out All Other Devices
          </button>
        </div>
        
        <div v-if="activeSessions.length === 0" class="text-center py-4">
          <i class="fas fa-info-circle text-muted mb-2 d-block" style="font-size: 2rem;"></i>
          <p class="text-muted">No active sessions found.</p>
        </div>
        
        <div v-else class="table-responsive">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Device</th>
                <th>Location</th>
                <th>Last Active</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="session in activeSessions" :key="session.id">
                <td>
                  <i :class="getDeviceIcon(session.device)" class="me-2"></i>
                  {{ session.device }}
                  <span v-if="session.current" class="badge bg-primary ms-2">Current</span>
                </td>
                <td>{{ session.location }}</td>
                <td>{{ formatDate(session.lastActive) }}</td>
                <td class="text-end">
                  <button 
                    v-if="!session.current"
                    class="btn btn-sm btn-outline-danger"
                    @click="revokeSession(session.id)"
                    :disabled="revokingSessionId === session.id"
                  >
                    <span v-if="revokingSessionId === session.id" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    {{ revokingSessionId === session.id ? 'Revoking...' : 'Revoke' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Security Tips -->
    <div class="alert alert-warning mt-4">
      <h5 class="h6"><i class="fas fa-exclamation-triangle me-2"></i>Security Tips</h5>
      <ul class="mb-0">
        <li>Always log out when using public or shared devices.</li>
        <li>Use a strong, unique password for your account.</li>
        <li>Enable two-factor authentication for added security.</li>
        <li>Regularly review your active sessions and revoke any that look suspicious.</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'SecuritySettings',
  setup() {
    const router = useRouter();
    const loading = ref(false);
    const verifying = ref(false);
    const twoFactorEnabled = ref(false);
    const showTwoFactorSetup = ref(false);
    const twoFactorSecret = ref('JBSWY3DPEHPK3PXP'); // This would come from your backend
    const twoFactorCode = ref('');
    const verificationError = ref('');
    const activeSessions = ref([]);
    const revokingSessionId = ref(null);
    
    // This would be generated by your backend
    const qrCodeUrl = ref('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/RespondrUK:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=RespondrUK');
    
    // Mock data - in a real app, this would come from your API
    const mockSessions = [
      { 
        id: '1', 
        device: 'MacBook Pro (Chrome, macOS)', 
        location: 'London, UK', 
        lastActive: new Date(),
        current: true
      },
      { 
        id: '2', 
        device: 'iPhone 13 (Safari, iOS)', 
        location: 'Manchester, UK', 
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        current: false
      },
      { 
        id: '3', 
        device: 'Windows PC (Firefox, Windows)', 
        location: 'Birmingham, UK', 
        lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        current: false
      }
    ];
    
    // Load user's current 2FA status and active sessions
    const loadSecurityData = async () => {
      try {
        loading.value = true;
        // In a real app, you would fetch this from your API
        // const response = await fetch('/api/security/settings');
        // const data = await response.json();
        // twoFactorEnabled.value = data.twoFactorEnabled;
        // activeSessions.value = data.activeSessions;
        
        // Mock data
        twoFactorEnabled.value = false;
        activeSessions.value = mockSessions;
      } catch (error) {
        console.error('Failed to load security settings:', error);
        if (window.showToast) {
          window.showToast('Failed to load security settings', 'danger');
        }
      } finally {
        loading.value = false;
      }
    };
    
    const toggleTwoFactor = () => {
      if (twoFactorEnabled.value) {
        disableTwoFactor();
      } else {
        showTwoFactorSetup.value = true;
        twoFactorCode.value = '';
        verificationError.value = '';
      }
    };
    
    const verifyTwoFactor = async () => {
      if (!twoFactorCode.value || twoFactorCode.value.length !== 6) return;
      
      verifying.value = true;
      verificationError.value = '';
      
      try {
        // In a real app, you would verify the code with your backend
        // const response = await fetch('/api/security/verify-2fa', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ code: twoFactorCode.value })
        // });
        // 
        // if (!response.ok) {
        //   throw new Error('Invalid verification code');
        // }
        
        // Mock success after 1 second
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        twoFactorEnabled.value = true;
        showTwoFactorSetup.value = false;
        
        if (window.showToast) {
          window.showToast('Two-factor authentication has been enabled', 'success');
        }
      } catch (error) {
        console.error('Verification failed:', error);
        verificationError.value = error.message || 'Verification failed. Please try again.';
      } finally {
        verifying.value = false;
      }
    };
    
    const disableTwoFactor = async () => {
      if (!confirm('Are you sure you want to disable two-factor authentication? This will reduce the security of your account.')) {
        return;
      }
      
      try {
        loading.value = true;
        
        // In a real app, you would call your API to disable 2FA
        // await fetch('/api/security/disable-2fa', { method: 'POST' });
        
        // Mock success
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        twoFactorEnabled.value = false;
        
        if (window.showToast) {
          window.showToast('Two-factor authentication has been disabled', 'success');
        }
      } catch (error) {
        console.error('Failed to disable 2FA:', error);
        if (window.showToast) {
          window.showToast('Failed to disable two-factor authentication', 'danger');
        }
      } finally {
        loading.value = false;
      }
    };
    
    const cancelTwoFactorSetup = () => {
      showTwoFactorSetup.value = false;
      twoFactorCode.value = '';
      verificationError.value = '';
    };
    
    const revokeSession = async (sessionId) => {
      if (!confirm('Are you sure you want to revoke this session?')) {
        return;
      }
      
      try {
        revokingSessionId.value = sessionId;
        
        // In a real app, you would call your API to revoke the session
        // await fetch(`/api/security/sessions/${sessionId}`, { method: 'DELETE' });
        
        // Mock success
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Remove the session from the list
        activeSessions.value = activeSessions.value.filter(s => s.id !== sessionId);
        
        if (window.showToast) {
          window.showToast('Session has been revoked', 'success');
        }
      } catch (error) {
        console.error('Failed to revoke session:', error);
        if (window.showToast) {
          window.showToast('Failed to revoke session', 'danger');
        }
      } finally {
        revokingSessionId.value = null;
      }
    };
    
    const revokeAllSessions = async () => {
      if (!confirm('Are you sure you want to log out all other devices? You will need to log in again on those devices.')) {
        return;
      }
      
      try {
        loading.value = true;
        
        // In a real app, you would call your API to revoke all other sessions
        // await fetch('/api/security/sessions', { method: 'DELETE' });
        
        // Mock success
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Keep only the current session
        const currentSession = activeSessions.value.find(s => s.current);
        activeSessions.value = currentSession ? [currentSession] : [];
        
        if (window.showToast) {
          window.showToast('All other sessions have been revoked', 'success');
        }
      } catch (error) {
        console.error('Failed to revoke sessions:', error);
        if (window.showToast) {
          window.showToast('Failed to revoke sessions', 'danger');
        }
      } finally {
        loading.value = false;
      }
    };
    
    const getDeviceIcon = (device) => {
      if (device.includes('iPhone') || device.includes('iOS') || device.includes('iPad')) {
        return 'fab fa-apple';
      } else if (device.includes('Android')) {
        return 'fab fa-android';
      } else if (device.includes('Windows')) {
        return 'fab fa-windows';
      } else if (device.includes('Mac') || device.includes('macOS')) {
        return 'fab fa-apple';
      } else if (device.includes('Linux')) {
        return 'fab fa-linux';
      } else {
        return 'fas fa-desktop';
      }
    };
    
    const formatDate = (date) => {
      if (!(date instanceof Date)) {
        date = new Date(date);
      }
      
      const now = new Date();
      const diffInMs = now - date;
      const diffInMins = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMins / 60);
      const diffInDays = Math.floor(diffInHours / 24);
      
      if (diffInMins < 1) {
        return 'Just now';
      } else if (diffInMins < 60) {
        return `${diffInMins} ${diffInMins === 1 ? 'minute' : 'minutes'} ago`;
      } else if (diffInHours < 24) {
        return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
      } else if (diffInDays < 7) {
        return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
      } else {
        return date.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      }
    };
    
    // Load data when component mounts
    onMounted(loadSecurityData);
    
    return {
      loading,
      verifying,
      twoFactorEnabled,
      showTwoFactorSetup,
      twoFactorSecret,
      twoFactorCode,
      verificationError,
      activeSessions,
      revokingSessionId,
      qrCodeUrl,
      toggleTwoFactor,
      verifyTwoFactor,
      disableTwoFactor,
      cancelTwoFactorSetup,
      revokeSession,
      revokeAllSessions,
      getDeviceIcon,
      formatDate
    };
  }
};
</script>

<style scoped>
.security-settings {
  max-width: 100%;
  overflow-x: hidden;
}

.table th, .table td {
  vertical-align: middle;
}

.badge {
  font-weight: 500;
  padding: 0.3em 0.6em;
}

.alert {
  border: none;
  border-radius: 0.5rem;
}

/* Responsive adjustments */
@media (max-width: 767.98px) {
  .d-flex {
    flex-direction: column;
    text-align: center;
  }
  
  .btn {
    margin-top: 1rem;
    width: 100%;
  }
  
  .table-responsive {
    border-radius: 0.5rem;
    border: 1px solid #dee2e6;
  }
}
</style>
