# User Management Dashboard

A modern, production-ready user management interface built with **Next.js**, **TypeScript**, **TailwindCSS**, **Radix UI**, **React Query**, **Axios**, and **Zustand**.

## 🌟 Features

- ✅ **User List Table** - Display users from JSONPlaceholder API
- ✅ **Search & Filter** - Real-time search by name, sort by email, filter by company
- ✅ **Pagination** - Navigate pages with Previous/Next buttons or direct page navigation
- ✅ **Add User** - Create new users with Radix Dialog form
- ✅ **Edit User** - Update existing users with pre-filled form
- ✅ **Delete User** - Remove users with confirmation dialog
- ✅ **Optimistic Updates** - Immediate UI feedback with automatic rollback on error
- ✅ **User Details Page** - View full user profile at `/users/[id]`
- ✅ **Dark Mode** - Toggle dark theme with persistence
- ✅ **Activity Log** - Track all user operations with timestamps
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
cd usermanage
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## 📖 Documentation
 documentation:
- Architecture & component structure
- State management with Zustand
- React Query configuration
- API integration
- Usage examples
- Troubleshooting

## 🏗️ Project Structure

```
usermanage/
├── app/
│   ├── layout.tsx                 # Root layout with providers
│   ├── page.tsx                   # Home page (users list)
│   ├── globals.css                # Global styles
│   └── users/
│       └── [id]/
│           └── page.tsx           # User detail page
├── components/
│   ├── Navbar.tsx                 # Top navigation bar
│   ├── RootLayoutClient.tsx       # Client-side wrapper
│   ├── UserList.tsx               # Users table with search/filter
│   ├── UserFormModal.tsx          # Add/Edit user dialog
│   ├── DeleteConfirmation.tsx     # Delete confirmation
│   └── ActivityLog.tsx            # Activity log sidebar
├── lib/
│   ├── api.ts                     # Axios API client
│   └── store.ts                   # Zustand store
└── package.json
```

## 🔧 Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS 4
- **Components**: Radix UI (Dialog, Select, Switch, Alert Dialog)
- **State**: Zustand with localStorage persistence
- **Data Fetching**: TanStack React Query v5
- **HTTP**: Axios
- **API**: JSONPlaceholder (https://jsonplaceholder.typicode.com)

## 🎯 Usage

### Search Users
Type in the search box to filter by user name in real-time.

### Sort by Email
Use the "Email: A-Z" / "Email: Z-A" dropdown to change sort order.

### Filter by Company
Select a company from the dropdown to show only users from that organization.

### Add User
1. Click "+ Add User" button
2. Fill in Name, Email, Phone, Company
3. Click Save

### Edit User
1. Click "Edit" button on any user row
2. Modify fields in the form
3. Click Save

### Delete User
1. Click "Delete" button on any user row
2. Confirm deletion in the dialog
3. User is removed from the list

### View Details
Click on a user name to navigate to their profile page.

### Dark Mode
Click the sun/moon toggle in the navbar to switch themes.

## 🌐 API Endpoints

All requests go to `https://jsonplaceholder.typicode.com`:

- `GET /users` - List all users
- `GET /users/:id` - Get single user
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

## 💡 Key Features Deep Dive

### Optimistic Updates
Users see changes immediately in the UI. If the API request fails, the UI automatically reverts.

### Smart Pagination
- Full user list cached for filtering
- Paginated requests when no filters active
- Smooth transitions between pages

### Persistent Dark Mode
Dark mode preference saved to localStorage and restored on next visit.

### Real-time Activity Log
Sidebar shows all operations (add, edit, delete) with relative timestamps.

## 🔐 Notes

- Using JSONPlaceholder API (mock data)
- POST/PUT/DELETE requests return mock responses
- All data is temporary and resets on API refresh
- Suitable for demo/internal tool purposes

## 📝 Environment Variables

Optional - create `.env.local` to override defaults:

```env
NEXT_PUBLIC_API_BASE_URL=https://jsonplaceholder.typicode.com
```

## 🐛 Troubleshooting

**Server won't start**: Ensure port 3000 is available
**Dark mode not persisting**: Check localStorage in browser DevTools
**Data not updating**: Clear React Query cache in DevTools or refresh page

## 📄 License

This project is open source and available for educational and internal tool use.

---

**Built with ❤️ using Next.js + TypeScript**

