# TiffinPro - Complete Tiffin Service Marketplace

A modern, full-stack web application connecting tiffin service providers with customers.

## 🚀 Live Demo
**Website:** https://tiffinpro-eat-smart.web.app/

## ✨ Features

### For Customers:
- 🔍 Browse and search tiffin services by location
- 📍 Filter by city, service type (Dine In/Parcel), price, and **food type (Veg/Non-Veg/Both)**
- ⭐ View ratings, reviews, and detailed service information
- 📅 Check weekly menus and holiday schedules
- 📝 Apply for services directly through the platform
- 💬 Leave reviews and ratings

### For Service Providers:
- 📊 Comprehensive dashboard with analytics
- 🍽️ Manage service details (pricing, location, contact info)
- 📋 View and manage customer applications
- 🗓️ Update weekly menu for each day
- 🎉 Set holiday schedules
- 📈 Track ratings and customer feedback

## 🛠️ Tech Stack

- **Frontend:** React + Vite
- **Styling:** Custom CSS with Glassmorphism
- **Authentication:** Clerk
- **Database:** Firebase Firestore
- **Hosting:** Firebase Hosting
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Routing:** React Router DOM

## 📦 Installation

1. Clone the repository
```bash
cd tiffin-pro
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables

**Firebase Configuration:**
- Go to [Firebase Console](https://console.firebase.google.com/project/flipr-ec895/settings/general)
- Copy your web app configuration
- Update `src/firebase.js` with your actual API keys

**Clerk Configuration:**
- Get your Clerk Publishable Key from [Clerk Dashboard](https://dashboard.clerk.com)
- Update `CLERK_PUBLISHABLE_KEY` in `src/App.jsx`

4. Run development server
```bash
npm run dev
```

5. Build for production
```bash
npm run build
```

6. Deploy to Firebase
```bash
npx firebase deploy
```

## 📁 Project Structure

```
tiffin-pro/
├── src/
│   ├── context/
│   │   └── UserContext.jsx          # User role management
│   ├── pages/
│   │   ├── RoleSelection.jsx        # Customer/Provider selection
│   │   ├── BrowseServices.jsx       # Service listing (Customer)
│   │   ├── ServiceDetails.jsx       # Detailed service view
│   │   └── provider/
│   │       ├── ProviderDashboard.jsx    # Analytics dashboard
│   │       ├── ManageService.jsx        # Service management
│   │       ├── ManageApplications.jsx   # Application management
│   │       └── ManageMenu.jsx           # Menu & holidays
│   ├── App.jsx                      # Main app with routing
│   ├── firebase.js                  # Firebase configuration
│   └── index.css                    # Global styles
├── public/
├── firebase.json                    # Firebase hosting config
├── .firebaserc                      # Firebase project config
└── package.json
```

## 🗄️ Database Schema

### Collections:

**users**
- uid, email, name, role (customer/provider), phone, location

**services**
- serviceId, providerId, serviceName, description, location
- serviceType (dineIn/parcel), pricing, weeklyMenu, holidays
- contactInfo, ratings, isActive

**applications**
- applicationId, serviceId, customerId, customerInfo
- preferredPlan, message, status (pending/accepted/rejected)

**reviews**
- reviewId, serviceId, customerId, rating (1-5), comment

## 🎯 User Flows

### Customer Journey:
1. Sign up / Login with Clerk
2. Select "Customer" role
3. Browse services with filters
4. View service details, menu, reviews
5. Apply for service
6. Track application status

### Provider Journey:
1. Sign up / Login with Clerk
2. Select "Provider" role
3. Create service listing
4. Set pricing and menu
5. Manage customer applications
6. Update menu and holidays
7. View analytics

## 🔐 Security

- Role-based access control
- Protected routes for customers and providers
- Firebase Security Rules (to be configured)
- Clerk authentication with JWT

## 📝 TODO

- [ ] Add Firebase API keys to `src/firebase.js`
- [ ] Add Clerk Publishable Key to `src/App.jsx`
- [ ] Configure Firebase Security Rules
- [ ] Add image upload functionality
- [ ] Implement real-time notifications
- [ ] Add payment integration
- [ ] Mobile responsive improvements

## 🤝 Contributing

This is a personal project, but suggestions are welcome!

## 📄 License

MIT License

## 👨‍💻 Author

Built with ❤️ for a healthier world

---

**Note:** Remember to add your actual Firebase and Clerk credentials before deploying!
