# TiffinPro - System Architecture

## User Roles

### 1. Customer (End User)
- Browse tiffin services by location
- Filter by service type, pricing, ratings
- View detailed service information
- Apply for services via email/contact
- Leave reviews and ratings

### 2. Service Provider (Admin)
- Create and manage tiffin service listings
- Dashboard with analytics
- Manage customer applications
- Update menu, pricing, holidays
- View and respond to reviews

## Database Schema (Firestore)

### Collections:

#### `users`
```
{
  uid: string,
  email: string,
  name: string,
  role: "customer" | "provider",
  phone: string,
  createdAt: timestamp,
  location: {
    city: string,
    area: string,
    coordinates: { lat, lng }
  }
}
```

#### `services`
```
{
  serviceId: string,
  providerId: string (ref to users),
  serviceName: string,
  description: string,
  location: {
    address: string,
    city: string,
    area: string,
    coordinates: { lat, lng }
  },
  serviceType: ["dineIn", "parcel"],
  pricing: {
    oneTimeDay: number,
    oneTimeNight: number,
    twoTimesPerMonth: number
  },
  weeklyMenu: {
    monday: { day: string, night: string },
    tuesday: { day: string, night: string },
    // ... other days
  },
  holidays: [{ date: timestamp, reason: string }],
  images: [string],
  contactInfo: {
    email: string,
    phone: string,
    whatsapp: string
  },
  ratings: {
    average: number,
    count: number
  },
  isActive: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `applications`
```
{
  applicationId: string,
  serviceId: string (ref),
  customerId: string (ref),
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  preferredPlan: string,
  message: string,
  status: "pending" | "accepted" | "rejected",
  appliedAt: timestamp
}
```

#### `reviews`
```
{
  reviewId: string,
  serviceId: string (ref),
  customerId: string (ref),
  customerName: string,
  rating: number (1-5),
  comment: string,
  createdAt: timestamp
}
```

## Pages & Routes

### Customer Routes:
- `/` - Landing page
- `/browse` - Browse all services
- `/service/:id` - Service details
- `/apply/:id` - Application form
- `/my-applications` - Customer's applications

### Provider Routes:
- `/provider/dashboard` - Analytics & overview
- `/provider/service` - Manage service details
- `/provider/applications` - View customer applications
- `/provider/menu` - Update weekly menu
- `/provider/reviews` - View & respond to reviews

## Features Implementation Priority

1. ✅ Landing page with hero & features
2. 🔄 Authentication (Clerk) with role selection
3. 🔄 Firebase Firestore setup
4. 🔄 Customer: Browse & search services
5. 🔄 Customer: Service details page
6. 🔄 Customer: Application form
7. 🔄 Provider: Dashboard with analytics
8. 🔄 Provider: Service management
9. 🔄 Provider: Application management
10. 🔄 Reviews & ratings system
