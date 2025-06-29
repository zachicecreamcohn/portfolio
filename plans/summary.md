# Portfolio Site Structure Analysis

## Overview
This portfolio site is built with Next.js, a React framework, and uses TypeScript for type safety. The site showcases Zach Cohn's work as both a theatre artist (lighting and projection designer) and a software engineer.

## Technology Stack
- **Framework**: Next.js (version 14+)
- **Language**: TypeScript
- **Styling**: CSS Modules + Bootstrap
- **Icons**: Tabler Icons, Devicon
- **Analytics**: Google Analytics
- **Deployment**: Likely using Vercel (standard for Next.js)
- **Image Hosting**: Cloudflare Images (based on URLs in db.json)

## Site Architecture

### Project Structure
The site follows the standard Next.js App Router structure:
- `/src/app/` - Contains page routes and layouts
- `/src/components/` - Reusable UI components
- `/public/` - Static assets (images, fonts, icons, data)

### Key Components
1. **Layout System**:
   - `RootLayout` (`src/app/layout.tsx`) - Provides the main HTML structure
   - `MainContainer` - Wraps content with consistent styling
   - `TopContainer` - Special container for the top section of pages

2. **Navigation**:
   - `NavBar` - Responsive navigation with links to main sections
   - Handles active state based on current route
   - Shows scrolling effect when page is scrolled

3. **UI Components**:
   - `Button` - Custom button component with different styles
   - `Footer` - Contains social links (GitHub, LinkedIn)
   - `ThemeSwitch` - Likely for toggling between light/dark modes
   - `WorkPreview` - Card component for showcasing portfolio items
   - `TechnologyIcon` - For displaying tech stack icons in the dev section
   - `TechnologyList` - Groups technology icons
   - `Video` - Component for embedding videos

### Page Structure
1. **Home** (`/src/app/page.tsx`):
   - Hero section with introduction
   - Call-to-action buttons
   - Profile image

2. **About** (`/src/app/about/page.tsx`):
   - Personal introduction
   - Professional background
   - Profile image

3. **Design** (`/src/app/design/page.tsx`):
   - Grid of theatre/design projects
   - Each project links to a dynamic route for its details

4. **Design Project Pages** (`/src/app/design/[slug]/page.tsx`):
   - Dynamic routes for individual design projects
   - Shows images, videos, and project details
   - Data comes from db.json

5. **Dev** (`/src/app/dev/page.tsx`):
   - Overview of software engineering experience
   - Work experience sections
   - Technologies used

6. **Contact** (`/src/app/contact/page.tsx`):
   - Contact form or information

### Data Management
- Project data is stored in `/public/data/db.json`
- Uses a structured format for portfolio items
- Each project has:
  - Title and description
  - Images (with designated thumbnail)
  - Videos (if applicable)
  - Introduction text and paragraphs
  - Link for routing

### Styling
- Uses CSS Modules for component-scoped styling
- Bootstrap for grid and responsive layout
- Custom theming system (theming.css)
- Custom fonts loaded from `/public/fonts/`
- Consistent color scheme through CSS variables

### Notable Features
1. **Responsive Design**:
   - Mobile-friendly layout using Bootstrap grid
   - Adapts to different screen sizes

2. **Image Optimization**:
   - Uses Next.js Image component for performance
   - Images hosted on Cloudflare for optimization

3. **External Integrations**:
   - Social media links
   - Video embedding capabilities
   - Contact functionality

## Content Organization
The portfolio is organized into two main sections:

1. **Design Work**:
   - Theatre projects (lighting and projection design)
   - Interactive installations
   - Visual art projects

2. **Software Development**:
   - Professional experience
   - Technologies used
   - Project descriptions

This dual-focus approach effectively showcases both aspects of Zach's career and highlights the intersection of technology and art in his work.