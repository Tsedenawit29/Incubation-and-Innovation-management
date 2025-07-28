# IIMS Frontend - Incubation and Innovation Management System

This is the React frontend for the IIMS (Incubation and Innovation Management System) application.

## Features

### Public Features
- **Landing Page**: Welcome page with links to tenant and admin registration
- **Tenant Application**: Form for organizations to apply for tenant registration
- **Admin Registration**: Form for users to apply for admin roles (for approved tenants)

### Super Admin Features
- **User Management**: Full CRUD operations for users
- **Tenant Management**: Review and approve/reject tenant applications
- **Admin Request Management**: Review and approve/reject admin requests
- **Dashboard**: Overview of all system activities

### Tenant Admin Features
- **User Management**: Manage users within their tenant
- **Dashboard**: Tenant-specific overview

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Backend server running on `http://localhost:8081`

## Installation

1. **Navigate to the frontend directory**:
   ```bash
   cd iims_frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

The application will open in your browser at `http://localhost:3000`.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (not recommended)

## Project Structure

```
src/
├── api/                    # API service modules
│   ├── auth.js            # Authentication API calls
│   ├── users.js           # User management API calls
│   ├── tenants.js         # Tenant management API calls
│   └── adminRequests.js   # Admin request API calls
├── components/            # Reusable UI components
│   ├── modals/           # Modal components
│   ├── tables/           # Table components
│   └── forms/            # Form components
├── hooks/                # Custom React hooks
│   └── useAuth.js        # Authentication hook
├── pages/                # Page components
│   ├── LoginPage.jsx     # Login page
│   ├── DashboardPage.jsx # Main dashboard
│   ├── LandingPage.jsx   # Public landing page
│   └── ...               # Other pages
└── App.js                # Main application component
```

## Usage

### For Organizations (Tenants)

1. **Visit the landing page** at `http://localhost:3000`
2. **Click "Apply for Tenant Registration"**
3. **Fill out the tenant application form** with your organization details
4. **Submit the application** - it will be reviewed by the super admin
5. **Wait for approval** - you'll be notified when your application is approved

### For Admin Users

1. **Ensure your organization is an approved tenant**
2. **Visit the landing page** at `http://localhost:3000`
3. **Click "Apply for Admin Role"**
4. **Fill out the admin registration form**
5. **Submit the application** - it will be reviewed by the super admin
6. **Receive credentials** - upon approval, you'll receive login credentials via email

### For Super Admins

1. **Login** at `http://localhost:3000/login`
2. **Access the dashboard** with user management features
3. **Navigate to "Tenant Management"** to review tenant applications
4. **Navigate to "Admin Requests"** to review admin applications
5. **Approve or reject applications** with appropriate reasons

## API Endpoints

The frontend communicates with the backend API at `http://localhost:8081/api`:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/users` - Get all users
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `PUT /api/users/{id}/role` - Update user role
- `PUT /api/users/{id}/status` - Update user status
- `PUT /api/users/{id}/password` - Change user password

### Tenant Management
- `POST /api/tenant/apply` - Apply for tenant registration
- `GET /api/tenant/pending` - Get pending tenant applications
- `GET /api/tenant` - Get all tenants
- `POST /api/tenant/approve/{id}` - Approve tenant
- `POST /api/tenant/reject/{id}` - Reject tenant

### Admin Requests
- `POST /api/users/request-admin` - Request admin role
- `GET /api/users/pending-admins` - Get pending admin requests
- `GET /api/users/admin-requests` - Get all admin requests
- `POST /api/users/approve-admin/{id}` - Approve admin request
- `POST /api/users/reject-admin/{id}` - Reject admin request

## Configuration

The API base URL is configured in each API service file. To change the backend URL, update the `API_URL` constant in the following files:

- `src/api/auth.js`
- `src/api/users.js`
- `src/api/tenants.js`
- `src/api/adminRequests.js`

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend CORS configuration allows requests from `http://localhost:3000`

2. **API Connection Errors**: Verify the backend server is running on `http://localhost:8081`

3. **Authentication Issues**: Check that JWT tokens are being properly stored and sent with requests

4. **Build Errors**: Ensure all dependencies are installed with `npm install`

### Development Tips

- Use browser developer tools to monitor network requests
- Check the browser console for JavaScript errors
- Verify API responses in the Network tab
- Use React Developer Tools for component debugging

## Contributing

1. Follow the existing code structure and naming conventions
2. Add proper error handling for API calls
3. Include loading states for better UX
4. Test all functionality before submitting changes
5. Update documentation for any new features

## License

This project is part of the IIMS (Incubation and Innovation Management System).
