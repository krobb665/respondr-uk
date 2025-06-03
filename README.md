# Respondr UK

A multi-tenant CAD (Computer-Aided Dispatch) system for Medical and Security teams.

## Features

- Incident reporting and management
- Real-time resource tracking
- Multi-tenant architecture
- Secure authentication and authorization
- Progressive Web App (PWA) support
- Responsive design

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Start the development server: `npm run dev`

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_KEY=your_supabase_service_key
```

## Netlify Deployment

This project is configured for deployment on Netlify. To deploy:

1. Push your code to a GitHub repository
2. Connect the repository to Netlify
3. Set up the following environment variables in Netlify:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon/public key
   - `VITE_SUPABASE_SERVICE_KEY`: Your Supabase service role key (for server-side operations)

### Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=YOUR_REPO_URL)

## Local Development with Netlify Functions

To run the project locally with Netlify Functions:

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Start development server with Netlify Functions
ntl dev
```

Visit `http://localhost:8888` to view the app. Netlify Functions will be available at `/.netlify/functions/`.

## License

This project is licensed under the MIT License.
