import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

// Validate environment variables
const validateEnv = () => {
    const requiredVars = [
        { name: 'VITE_SUPABASE_URL', value: supabaseUrl },
        { name: 'VITE_SUPABASE_ANON_KEY', value: supabaseAnonKey },
        { name: 'VITE_SUPABASE_SERVICE_KEY', value: supabaseServiceKey }
    ];

    const missing = requiredVars.filter(v => !v.value);
    if (missing.length > 0) {
        const missingNames = missing.map(v => v.name).join(', ');
        console.error(`Missing required environment variables: ${missingNames}`);
        return false;
    }
    return true;
};

// Initialize Supabase client with Anon Key (for client-side operations)
export const createSupabase = () => {
    if (!validateEnv()) {
        throw new Error('Database configuration error. Please check your environment variables.');
    }
    
    try {
        return createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
                flowType: 'pkce',
                debug: process.env.NODE_ENV === 'development'
            },
            global: {
                headers: { 'X-Client-Info': 'respondr-uk' }
            }
        });
    } catch (error) {
        console.error('Failed to initialize Supabase client:', error);
        throw new Error('Failed to initialize database connection');
    }
};

// Initialize Supabase Admin client with Service Role Key (for server-side operations)
export const createAdminSupabase = () => {
    if (!validateEnv()) {
        throw new Error('Database configuration error. Please check your environment variables.');
    }
    
    try {
        return createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            },
            global: {
                headers: { 'X-Client-Info': 'respondr-uk-admin' }
            }
        });
    } catch (error) {
        console.error('Failed to initialize Supabase Admin client:', error);
        throw new Error('Failed to initialize admin database connection');
    }
};

// Auth functions
export const signUp = async (email, password, userType) => {
    const supabase = createSupabase();
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                user_type: userType,
                tenant_type: userType.toLowerCase()
            }
        }
    });
    
    if (error) throw error;
    return data;
};

export const signIn = async (email, password) => {
    const supabase = createSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    
    if (error) throw error;
    return data;
};

export const signOut = async () => {
    const supabase = createSupabase();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

// Database functions
export const getIncidents = async (tenantType) => {
    const supabase = createSupabase();
    const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .eq('tenant_type', tenantType);
    
    if (error) throw error;
    return data;
};

export const createIncident = async (incidentData) => {
    const supabase = createSupabase();
    const { data, error } = await supabase
        .from('incidents')
        .insert([incidentData])
        .select();
    
    if (error) throw error;
    return data[0];
};

export const updateIncident = async (id, updates) => {
    const supabase = createSupabase();
    const { data, error } = await supabase
        .from('incidents')
        .update(updates)
        .eq('id', id)
        .select();
    
    if (error) throw error;
    return data[0];
};

export const getAvailableUnits = async (tenantType) => {
    const supabase = createSupabase();
    const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('tenant_type', tenantType)
        .is('assigned_incident_id', null);
    
    if (error) throw error;
    return data;
};
