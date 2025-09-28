# Calendly Integration Setup

## Overview
The booking system has been integrated with Calendly for scheduling coaching sessions. Each service has its own Calendly URL that needs to be configured.

## Setup Instructions

### 1. Create Calendly Account
- Sign up at [calendly.com](https://calendly.com)
- Create your coaching business profile

### 2. Create Event Types
Create three different event types in Calendly:

#### A. Coaching Package (10 sessions)
- **Event Name**: "Koučovací balíček - 10 sezení"
- **Duration**: 60 minutes
- **Description**: "Komplexní koučovací program pro hlubokou transformaci vašeho života"
- **Price**: 15,000 CZK

#### B. Single Coaching Session
- **Event Name**: "Jednorázový koučing - 1 sezení"
- **Duration**: 60 minutes
- **Description**: "Fokusované koučovací sezení pro řešení konkrétních výzev"
- **Price**: 2,500 CZK

#### C. Initial Consultation
- **Event Name**: "Vstupní konzultace - 30 minut"
- **Duration**: 30 minutes
- **Description**: "Krátká konzultace pro seznámení s koučovacím procesem"
- **Price**: 800 CZK

### 3. Update Calendly URLs
Replace the placeholder URLs in the following files with your actual Calendly URLs:

#### File: `app/rezervace/koucovy-balicek/page.tsx`
```typescript
const calendlyUrl = "https://calendly.com/your-username/coaching-package"
```

#### File: `app/rezervace/jednorazovy-koucink/page.tsx`
```typescript
const calendlyUrl = "https://calendly.com/your-username/single-coaching"
```

#### File: `app/rezervace/vstupni-konzultace/page.tsx`
```typescript
const calendlyUrl = "https://calendly.com/your-username/consultation"
```

### 4. Customize Calendly Widget
- Set your availability in Calendly
- Configure time zones (Central European Time)
- Add your contact information
- Set up payment integration if needed
- Customize the booking form with required fields

### 5. Test the Integration
1. Visit `/rezervace` to see the booking page
2. Click on each service option
3. Test the Calendly widget functionality
4. Verify that bookings are properly received

## Features Included

### Booking Page (`/rezervace`)
- Three service options with pricing
- Detailed descriptions and features
- Process explanation
- FAQ section
- Responsive design

### Individual Service Pages
- **Coaching Package** (`/rezervace/koucovy-balicek`)
  - 10-session program details
  - Benefits and process explanation
  - Testimonials
  - Calendly integration

- **Single Coaching** (`/rezervace/jednorazovy-koucink`)
  - One-time session details
  - Quick results focus
  - Suitable situations
  - Calendly integration

- **Initial Consultation** (`/rezervace/vstupni-konzultace`)
  - 30-minute consultation
  - No-commitment approach
  - Process explanation
  - Calendly integration

### Navigation
- Added "Rezervace" link to main navigation
- Updated coaching page CTA to link to booking page
- Mobile-responsive navigation

## Technical Notes

### Calendly Widget Integration
- Uses Calendly's inline widget
- Dynamically loads Calendly script
- Responsive design with proper styling
- Toggle functionality to show/hide calendar

### Styling
- Consistent with existing design system
- Uses Tailwind CSS classes
- Custom color scheme for each service type
- Mobile-responsive layout

### SEO Considerations
- Proper meta descriptions
- Semantic HTML structure
- Fast loading times
- Mobile-friendly design

## Next Steps
1. Replace placeholder Calendly URLs with actual URLs
2. Test the complete booking flow
3. Set up payment processing in Calendly
4. Configure email notifications
5. Add analytics tracking if needed
