import { createRouter, createWebHistory } from 'vue-router';
import { createSupabase } from '../supabase';

// Lazy load route components
const Login = () => import('../views/Login.vue');
const Signup = () => import('../views/Signup.vue');
const Dashboard = () => import('../views/Dashboard.vue');
const IncidentForm = () => import('../views/IncidentForm.vue');
const IncidentDetails = () => import('../views/IncidentDetails.vue');
const Profile = () => import('../views/Profile.vue');
const Settings = () => import('../views/Settings.vue');
const NotFound = () => import('../views/NotFound.vue');

const routes = [
    {
        path: '/',
        redirect: '/login',
        meta: { requiresAuth: false }
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { requiresAuth: false }
    },
    {
        path: '/signup',
        name: 'Signup',
        component: Signup,
        meta: { requiresAuth: false }
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { requiresAuth: true }
    },
    {
        path: '/incidents/new',
        name: 'NewIncident',
        component: IncidentForm,
        meta: { requiresAuth: true }
    },
    {
        path: '/incidents/:id',
        name: 'IncidentDetails',
        component: IncidentDetails,
        meta: { requiresAuth: true },
        props: true
    },
    {
        path: '/profile',
        name: 'Profile',
        component: Profile,
        meta: { requiresAuth: true }
    },
    {
        path: '/settings',
        name: 'Settings',
        component: Settings,
        meta: { requiresAuth: true },
        children: [
            {
                path: '',
                redirect: { name: 'Profile' }
            },
            {
                path: 'security',
                name: 'SecuritySettings',
                component: () => import('../views/settings/Security.vue')
            },
            {
                path: 'notifications',
                name: 'NotificationSettings',
                component: () => import('../views/settings/Notifications.vue')
            },
            {
                path: 'billing',
                name: 'BillingSettings',
                component: () => import('../views/settings/Billing.vue')
            },
            {
                path: 'team',
                name: 'TeamSettings',
                component: () => import('../views/settings/Team.vue')
            }
        ]
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFound,
        meta: { requiresAuth: false }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// Navigation guard to check authentication
router.beforeEach(async (to, from, next) => {
    const supabase = createSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    
    // Check if the route requires authentication
    if (to.matched.some(record => record.meta.requiresAuth) && !session) {
        next({ name: 'Login' });
    } else if ((to.name === 'Login' || to.name === 'Signup') && session) {
        // Redirect to dashboard if user is already logged in
        next({ name: 'Dashboard' });
    } else {
        next();
    }
});

export default router;
