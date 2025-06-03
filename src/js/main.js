// Import necessary modules
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import { createSupabase } from './supabase';

// Initialize the app
const initApp = async () => {
    const app = createApp(App);
    
    // Add plugins
    app.use(createPinia());
    app.use(router);
    
    // Provide Supabase client
    const supabase = createSupabase();
    app.provide('supabase', supabase);
    
    // Mount the app
    app.mount('#app');
};

// Initialize the application
initApp().catch(console.error);
