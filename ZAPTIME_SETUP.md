# Zaptime Setup Guide

## Overview
The booking system has been updated to use Zaptime instead of Calendly. The new `BookingWidget` component is flexible and can work with different booking platforms.

## What Changed

### 1. New BookingWidget Component
- **File**: `components/BookingWidget.tsx`
- **Features**:
  - Supports multiple platforms: Zaptime, Calendly, or generic iframe
  - Same styling and color schemes as before
  - Flexible configuration

### 2. Updated Booking Pages
All booking pages now use the new `BookingWidget`:
- `app/rezervace/vstupni-konzultace/page.tsx` (První konzultace)
- `app/rezervace/jednorazovy-koucink/page.tsx` (Jednorázový koučing)
- `app/rezervace/koucovy-balicek/page.tsx` (Koučovací balíček)

## Setup Instructions

### 1. Get Your Zaptime Tokens
1. Sign up for Zaptime at [zaptime.com](https://zaptime.com)
2. Create your booking pages for each service:
   - První konzultace (30 min, free)
   - Jednorázový koučing (60 min, paid)
   - Koučovací balíček (multiple sessions, paid)
3. Get the API tokens for each booking page from your Zaptime dashboard

### 2. Update the Tokens
Replace the placeholder tokens in each booking page:

**První konzultace** (`app/rezervace/vstupni-konzultace/page.tsx`):
```typescript
const zaptimeToken = "YOUR_ZAPTIME_TOKEN_HERE" // Replace with your actual Zaptime token
```

**Jednorázový koučing** (`app/rezervace/jednorazovy-koucink/page.tsx`):
```typescript
const zaptimeToken = "WpwdY9lclHB6cPan45FrIIbEGPGsr86D" // Already configured
```

**Koučovací balíček** (`app/rezervace/koucovy-balicek/page.tsx`):
```typescript
const zaptimeToken = "YOUR_ZAPTIME_TOKEN_HERE" // Replace with your actual Zaptime token
```

### 3. Platform Configuration
The widget is currently set to use Zaptime (`platform="zaptime"`). If you need to switch back to Calendly or use a different platform, you can change the `platform` prop:

```typescript
<BookingWidget 
  url={bookingUrl}
  platform="zaptime" // or "calendly" or "iframe"
  // ... other props
/>
```

## Features

### Supported Platforms
- **Zaptime**: Uses Zaptime's JavaScript SDK with token-based authentication (default)
- **Calendly**: Uses Calendly's JavaScript widget
- **iframe**: Generic iframe for any booking platform

### Color Schemes
- `primary`: Default primary colors
- `blue`: Blue theme
- `green`: Green theme
- `custom-green`: Custom green theme (matches your brand)
- `subtle-primary`: Subtle primary theme

### Styling
- Responsive design
- Customizable colors and themes
- Rounded corners and shadows
- Mobile-friendly

## Testing
1. Update the URLs with your actual Zaptime links
2. Test each booking page to ensure the widgets load correctly
3. Verify that bookings are properly created in your Zaptime account

## Migration Notes
- The old `CalendlyWidget` component has been removed
- All existing styling and functionality is preserved
- The transition is seamless for users
