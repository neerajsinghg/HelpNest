# HelpNest Admin Panel (React)

Modern React-based admin panel for the HelpNest service marketplace platform.

## Features

- 🔐 **Authentication**: Secure login with JWT token management
- 📊 **Dashboard**: Overview with key metrics and analytics
- ✅ **KYC Management**: Approve/reject service provider documents
- 👥 **User Management**: Activate/deactivate users
- 🛠️ **Provider Management**: View and manage service providers
- 📂 **Category Management**: Manage service categories
- 💳 **Payment Tracking**: Monitor all transactions and payment analytics

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: CSS Modules
- **Icons**: Material Icons

## Project Structure

```
src/
├── components/
│   ├── Layout/           # Layout components
│   │   ├── MainLayout.jsx
│   │   ├── Sidebar.jsx
│   │   └── PageHeader.jsx
│   ├── UI/               # Reusable UI components
│   │   ├── StatCard.jsx
│   │   ├── Badge.jsx
│   │   ├── Button.jsx
│   │   └── LoadingSpinner.jsx
│   └── ProtectedRoute.jsx
├── pages/                # Page components
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── KYCApproval.jsx
│   ├── Users.jsx
│   ├── Providers.jsx
│   ├── Categories.jsx
│   └── Payments.jsx
├── services/             # API services
│   ├── api.js
│   └── adminService.js
├── contexts/             # React contexts
│   └── AuthContext.jsx
├── utils/                # Utility functions
│   └── formatters.js
└── App.jsx               # Root component with routing
```

## Getting Started

### Prerequisites

- Node.js 16+ installed
- Backend API running on `http://localhost:8000`

### Installation

```bash
cd admin-panel-react
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The app will run on `http://localhost:3001`

### Build for Production

```bash
npm run build
```

Build output will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## API Configuration

The admin panel connects to the backend API at `http://localhost:8000/api`. To change this, update the `API_URL` in `src/services/api.js`.

## Default Admin Credentials

Please check with the backend team for admin credentials.

## Features Overview

### Dashboard

- View total users, providers, jobs, revenue
- Monitor pending KYC submissions
- Track completed jobs

### KYC Approval

- Review pending KYC submissions
- Approve or reject with reasons
- View submitted documents count

### User Management

- View all platform users
- Activate/deactivate user accounts
- See user roles and status

### Providers

- List all service providers
- View provider statistics

### Categories

- Manage service categories
- Delete categories
- View category status

### Payments

- Payment analytics by method
- Transaction history
- Payment status tracking

## License

This project is part of the HelpNest platform.
