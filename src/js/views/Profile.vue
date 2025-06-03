<template>
  <div class="profile-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
              <h2 class="h5 mb-0">My Profile</h2>
            </div>
            <div class="card-body">
              <form @submit.prevent="updateProfile">
                <div class="row mb-4">
                  <div class="col-md-4 text-center">
                    <div class="profile-avatar mb-3">
                      <i class="fas fa-user-circle"></i>
                      <button 
                        type="button" 
                        class="btn btn-sm btn-outline-primary mt-2"
                        @click="triggerFileUpload"
                      >
                        Change Photo
                      </button>
                      <input 
                        type="file" 
                        ref="fileInput" 
                        class="d-none" 
                        accept="image/*"
                        @change="handleFileUpload"
                      >
                    </div>
                  </div>
                  <div class="col-md-8">
                    <div class="mb-3">
                      <label class="form-label">Email</label>
                      <input 
                        type="email" 
                        class="form-control" 
                        v-model="profile.email" 
                        disabled
                      >
                    </div>
                    <div class="row">
                      <div class="col-md-6 mb-3">
                        <label class="form-label">First Name</label>
                        <input 
                          type="text" 
                          class="form-control" 
                          v-model="profile.first_name" 
                          required
                        >
                      </div>
                      <div class="col-md-6 mb-3">
                        <label class="form-label">Last Name</label>
                        <input 
                          type="text" 
                          class="form-control" 
                          v-model="profile.last_name" 
                          required
                        >
                      </div>
                    </div>
                  </div>
                </div>

                
                <div class="card mb-4">
                  <div class="card-header bg-light">
                    <h3 class="h6 mb-0">Change Password</h3>
                  </div>
                  <div class="card-body">
                    <div class="mb-3">
                      <label class="form-label">Current Password</label>
                      <input 
                        type="password" 
                        class="form-control" 
                        v-model="password.current"
                        :disabled="!password.new || !password.confirm"
                      >
                    </div>
                    <div class="mb-3">
                      <label class="form-label">New Password</label>
                      <input 
                        type="password" 
                        class="form-control" 
                        v-model="password.new"
                        @input="validatePassword"
                      >
                      <div class="form-text text-muted small">
                        Password must be at least 8 characters long and include a number and special character.
                      </div>
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Confirm New Password</label>
                      <input 
                        type="password" 
                        class="form-control" 
                        v-model="password.confirm"
                        :class="{ 'is-invalid': password.mismatch }"
                        @input="validatePassword"
                      >
                      <div v-if="password.mismatch" class="invalid-feedback">
                        Passwords do not match.
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="d-flex justify-content-between align-items-center">
                  <button 
                    type="button" 
                    class="btn btn-outline-secondary"
                    @click="$router.go(-1)"
                  >
                    <i class="fas fa-arrow-left me-2"></i>Back
                  </button>
                  <div>
                    <button 
                      type="button" 
                      class="btn btn-outline-danger me-2"
                      @click="resetForm"
                    >
                      Reset
                    </button>
                    <button 
                      type="submit" 
                      class="btn btn-primary"
                      :disabled="loading || password.mismatch"
                    >
                      <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      {{ loading ? 'Saving...' : 'Save Changes' }}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'Profile',
  setup() {
    const router = useRouter();
    const fileInput = ref(null);
    const loading = ref(false);
    const profile = ref({
      email: '',
      first_name: '',
      last_name: '',
      avatar_url: ''
    });
    
    const password = ref({
      current: '',
      new: '',
      confirm: '',
      mismatch: false
    });
    
    const originalProfile = ref(null);
    
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');
        
        // Fetch additional profile data from your users table
        const { data: profileData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        profile.value = {
          email: user.email,
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          avatar_url: profileData.avatar_url || ''
        };
        
        // Save original values for reset
        originalProfile.value = { ...profile.value };
        
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (window.showToast) {
          window.showToast('Failed to load profile data', 'danger');
        }
      }
    };
    
    const validatePassword = () => {
      if (password.value.new && password.value.confirm) {
        password.value.mismatch = password.value.new !== password.value.confirm;
      } else {
        password.value.mismatch = false;
      }
    };
    
    const updateProfile = async () => {
      if (password.value.mismatch) return;
      
      loading.value = true;
      try {
        const updates = {};
        const user = supabase.auth.user();
        
        // Update profile in users table
        const { error: profileError } = await supabase
          .from('users')
          .update({
            first_name: profile.value.first_name,
            last_name: profile.value.last_name,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
          
        if (profileError) throw profileError;
        
        // Update password if new password is provided
        if (password.value.new && password.value.current) {
          const { error: passwordError } = await supabase.auth.update({
            password: password.value.new
          });
          
          if (passwordError) throw passwordError;
          
          // Reset password fields
          password.value = { current: '', new: '', confirm: '', mismatch: false };
        }
        
        if (window.showToast) {
          window.showToast('Profile updated successfully!', 'success');
        }
        
        // Update original values
        originalProfile.value = { ...profile.value };
        
      } catch (error) {
        console.error('Error updating profile:', error);
        if (window.showToast) {
          window.showToast(error.message || 'Failed to update profile', 'danger');
        }
      } finally {
        loading.value = false;
      }
    };
    
    const resetForm = () => {
      if (originalProfile.value) {
        profile.value = { ...originalProfile.value };
      }
      password.value = { current: '', new: '', confirm: '', mismatch: false };
    };
    
    const triggerFileUpload = () => {
      fileInput.value?.click();
    };
    
    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        if (window.showToast) {
          window.showToast('Image size should be less than 2MB', 'warning');
        }
        return;
      }
      
      try {
        loading.value = true;
        const user = supabase.auth.user();
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        
        // Upload the file
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        
        // Update user's avatar URL in the database
        const { error: updateError } = await supabase
          .from('users')
          .update({ avatar_url: publicUrl })
          .eq('id', user.id);
          
        if (updateError) throw updateError;
        
        // Update local state
        profile.value.avatar_url = publicUrl;
        originalProfile.value.avatar_url = publicUrl;
        
        if (window.showToast) {
          window.showToast('Profile picture updated successfully!', 'success');
        }
        
      } catch (error) {
        console.error('Error uploading avatar:', error);
        if (window.showToast) {
          window.showToast('Failed to upload profile picture', 'danger');
        }
      } finally {
        loading.value = false;
        // Reset file input
        if (fileInput.value) {
          fileInput.value.value = '';
        }
      }
    };
    
    // Fetch profile data when component mounts
    onMounted(fetchProfile);
    
    return {
      profile,
      password,
      loading,
      fileInput,
      validatePassword,
      updateProfile,
      resetForm,
      triggerFileUpload,
      handleFileUpload
    };
  }
};
</script>

<style scoped>
.profile-page {
  padding: 2rem 0;
}

.profile-avatar {
  width: 150px;
  height: 150px;
  margin: 0 auto;
  border-radius: 50%;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 3px solid #e9ecef;
  padding: 1rem;
}

.profile-avatar i {
  font-size: 6rem;
  color: #6c757d;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  margin-bottom: 1.5rem;
}

.card-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  font-weight: 600;
}

.form-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.btn {
  padding: 0.5rem 1.25rem;
  font-weight: 500;
  border-radius: 0.375rem;
}

/* Responsive adjustments */
@media (max-width: 767.98px) {
  .profile-page {
    padding: 1rem 0;
  }
  
  .profile-avatar {
    width: 120px;
    height: 120px;
    margin-bottom: 1.5rem;
  }
  
  .profile-avatar i {
    font-size: 5rem;
  }
  
  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }
  
  .d-flex.justify-content-between > * {
    width: 100%;
  }
  
  .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}
</style>
