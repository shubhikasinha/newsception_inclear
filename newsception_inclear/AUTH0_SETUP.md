# 🔐 Auth0 Integration Setup

## ✅ Auth0 is Now Integrated!

Auth0 authentication has been successfully integrated into the Newsception app.

## 📋 Environment Variables

Add these to your `.env.local` file:

```env
# Auth0 Configuration
AUTH0_SECRET=3fb146041d3b1a45fe372601605439a764f60c75b61208832b93515adf98c33f
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://dev-uiabct4ecz0yipry.us.auth0.com
AUTH0_CLIENT_ID=zuh4KhANwJb2jRMk80d3wvv5uoIp3HT5m
AUTH0_CLIENT_SECRET=7lOE3zLspKAUM8icJLap5ZyOgq0FDigz3s3Rd632WoAiM3UESJMjWgdFC8Q2uzSC
```

## 🎯 What's Been Added

### 1. Auth0 SDK Integration
- Installed `@auth0/nextjs-auth0` package
- Configured Auth0 routes at `/api/auth/[...auth0]`

### 2. User Provider
- Added `UserProvider` to root layout
- Provides Auth0 context to all pages

### 3. User Profile Component
- `app/components/auth/UserProfile.jsx`
- Shows user info when logged in
- Shows "Sign In" button when not logged in
- Includes sign out functionality

### 4. Protected Route Component
- `app/components/auth/ProtectedRoute.jsx`
- Wraps pages that require authentication
- Automatically redirects to login if not authenticated

### 5. API Integration
- Updated `app/lib/api.js` to include Auth0 tokens
- API requests automatically include Bearer token when user is logged in

## 🚀 Usage

### Login/Logout
- **Login**: Navigate to `/api/auth/login` or click "Sign In" button
- **Logout**: Navigate to `/api/auth/logout` or click "Sign Out" button

### Protecting Pages
Wrap any page component with `ProtectedRoute`:

```jsx
import ProtectedRoute from '../components/auth/ProtectedRoute';

export default function MyPage() {
  return (
    <ProtectedRoute>
      <div>Protected content here</div>
    </ProtectedRoute>
  );
}
```

### Using User Data
Use the `useUser` hook in any component:

```jsx
import { useUser } from '@auth0/nextjs-auth0/client';

export default function MyComponent() {
  const { user, error, isLoading } = useUser();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;
  if (!user) return <div>Not logged in</div>;
  
  return <div>Hello {user.name}!</div>;
}
```

### API Calls with Auth
The API client automatically includes Auth0 tokens:

```jsx
import { apiClient } from '../lib/api';

// This will automatically include Auth0 Bearer token if user is logged in
const data = await apiClient.searchNews('climate change');
```

## 🔧 Auth0 Dashboard Configuration

Make sure these settings are configured in your Auth0 Dashboard:

1. **Allowed Callback URLs**:
   ```
   http://localhost:3000/api/auth/callback
   ```

2. **Allowed Logout URLs**:
   ```
   http://localhost:3000
   ```

3. **Allowed Web Origins**:
   ```
   http://localhost:3000
   ```

4. **Application Type**: Regular Web Application

## 📍 Where Auth0 is Used

- **Homepage** (`/`) - User profile in header
- **Dashboard** (`/dashboard`) - User profile in header
- **All API calls** - Automatically include Auth0 tokens
- **Backend integration** - Tokens forwarded to backend API

## 🎨 UI Components

The `UserProfile` component shows:
- User avatar (from Auth0 profile picture)
- User name or email
- Sign In button (when not logged in)
- Sign Out button (when logged in)

## 🔒 Security

- Auth0 handles all authentication securely
- Tokens are stored in HTTP-only cookies
- API tokens are automatically included in requests
- Backend can verify tokens using Auth0 JWT verification

## 🐛 Troubleshooting

### "Login redirects but doesn't work"
- Check that callback URL is set in Auth0 dashboard
- Verify `AUTH0_BASE_URL` matches your app URL

### "API calls fail with 401"
- Ensure user is logged in
- Check that Auth0 token is being included
- Verify backend is configured to accept Auth0 tokens

### "User data not showing"
- Check browser console for errors
- Verify Auth0 environment variables are set
- Ensure `UserProvider` wraps your app

---

**Status**: ✅ Fully Integrated
**Auth0 Domain**: dev-uiabct4ecz0yipry.us.auth0.com

