# Smysluplné žití - Coaching Website

A modern coaching services website built with Next.js, TypeScript, Tailwind CSS, and Sanity CMS for content management.

## Features

- **Modern Design**: Clean, responsive design matching your Framer prototype
- **CMS Integration**: Sanity CMS for managing inspiration articles
- **Admin Interface**: Built-in admin panel for content management
- **SEO Optimized**: Server-side rendering and meta tags
- **Mobile Responsive**: Works perfectly on all devices

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **CMS**: Sanity
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Sanity CMS

1. Go to [sanity.io](https://sanity.io) and create a new project
2. Copy your project ID from the Sanity dashboard
3. Update the project ID in these files:
   - `sanity.config.ts`
   - `lib/sanity.ts`

### 3. Set up Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your-api-token
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

### 5. Access the Admin Panel

Visit [http://localhost:3000/studio](http://localhost:3000/studio) to manage your content.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── inspirace/         # Inspiration pages
│   ├── admin/             # Admin redirect
│   └── studio/            # Sanity Studio
├── components/            # React components
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── Services.tsx
│   ├── Inspiration.tsx
│   └── Footer.tsx
├── lib/                   # Utility functions
│   └── sanity.ts          # Sanity client
├── sanity/                # Sanity configuration
│   └── schemas/           # Content schemas
└── public/                # Static assets
```

## Content Management

### Adding Articles

1. Go to `/studio` in your browser
2. Click "Create" → "Article"
3. Fill in the required fields:
   - Title
   - Slug (auto-generated from title)
   - Excerpt
   - Main Image
   - Category
   - Published Date
   - Body content

### Managing Categories

1. In the Sanity Studio, go to "Category"
2. Create categories like "Work", "Life", "Career", etc.
3. Assign articles to categories

## Customization

### Colors

Update the color scheme in `tailwind.config.js`:

```javascript
colors: {
  primary: {
    // Your orange color palette
  }
}
```

### Content

- Update the hero section text in `components/Hero.tsx`
- Modify service descriptions in `components/Services.tsx`
- Change contact information in `components/Footer.tsx`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform

## Booking Integration

To integrate with your existing booking solution:

1. Update the contact buttons to link to your booking system
2. Add booking widgets to the relevant pages
3. Customize the contact form if needed

## Support

For questions or issues, please check the documentation or create an issue in the repository.
