import { lazy, Suspense } from 'react'
import { createBrowserRouter, Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomBar } from '@/components/layout/MobileBottomBar'
import { WhatsAppFab } from '@/components/layout/WhatsAppFab'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorBoundary } from './error-boundary'

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="space-y-4 w-full max-w-sm px-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  </div>
)

const lazy_ = (factory: () => Promise<{ default: React.ComponentType }>) => {
  const C = lazy(factory)
  return () => (
    <Suspense fallback={<PageLoader />}>
      <C />
    </Suspense>
  )
}

// Lazy page imports
const Home = lazy_(() => import('@/pages/home/HomePage'))
const Theatres = lazy_(() => import('@/pages/theatres/TheatresPage'))
const TheatreDetail = lazy_(() => import('@/pages/theatre-detail/TheatreDetailPage'))
const Celebrations = lazy_(() => import('@/pages/celebrations/CelebrationsPage'))
const Occasion = lazy_(() => import('@/pages/occasion/OccasionPage'))
const Packages = lazy_(() => import('@/pages/packages/PackagesPage'))
const Offers = lazy_(() => import('@/pages/offers/OffersPage'))
const Gallery = lazy_(() => import('@/pages/gallery/GalleryPage'))
const Reviews = lazy_(() => import('@/pages/reviews/ReviewsPage'))
const Locations = lazy_(() => import('@/pages/locations/LocationsPage'))
const LocationDetail = lazy_(() => import('@/pages/location-detail/LocationDetailPage'))
const Search = lazy_(() => import('@/pages/search/SearchPage'))
const Book = lazy_(() => import('@/pages/book/BookPage'))
const BookSuccess = lazy_(() => import('@/pages/book-success/BookSuccessPage'))
const BookFailed = lazy_(() => import('@/pages/book-failed/BookFailedPage'))
const MyBooking = lazy_(() => import('@/pages/my-booking/MyBookingPage'))
const MyBookingDetail = lazy_(() => import('@/pages/my-booking/MyBookingDetailPage'))
const Pass = lazy_(() => import('@/pages/pass/PassPage'))
const About = lazy_(() => import('@/pages/about/AboutPage'))
const Contact = lazy_(() => import('@/pages/contact/ContactPage'))
const Faq = lazy_(() => import('@/pages/faq/FaqPage'))
const Blog = lazy_(() => import('@/pages/blog/BlogPage'))
const BlogPost = lazy_(() => import('@/pages/blog-post/BlogPostPage'))
const Legal = lazy_(() => import('@/pages/legal/LegalPage'))
const NotFound = lazy_(() => import('@/pages/not-found/NotFoundPage'))

function RootLayout() {
  return (
    <ErrorBoundary>
      <Header />
      <Outlet />
      <Footer />
      <MobileBottomBar />
      <WhatsAppFab />
      <ScrollRestoration />
    </ErrorBoundary>
  )
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'theatres', element: <Theatres /> },
      { path: 'theatres/:slug', element: <TheatreDetail /> },
      { path: 'celebrations', element: <Celebrations /> },
      { path: 'celebrations/:occasion', element: <Occasion /> },
      { path: 'packages', element: <Packages /> },
      { path: 'offers', element: <Offers /> },
      { path: 'gallery', element: <Gallery /> },
      { path: 'reviews', element: <Reviews /> },
      { path: 'locations', element: <Locations /> },
      { path: 'locations/:slug', element: <LocationDetail /> },
      { path: 'search', element: <Search /> },
      { path: 'book', element: <Book /> },
      { path: 'book/success/:bookingId', element: <BookSuccess /> },
      { path: 'book/failed/:bookingId', element: <BookFailed /> },
      { path: 'my-booking', element: <MyBooking /> },
      { path: 'my-booking/:bookingId', element: <MyBookingDetail /> },
      { path: 'pass/:token', element: <Pass /> },
      { path: 'about', element: <About /> },
      { path: 'contact', element: <Contact /> },
      { path: 'faq', element: <Faq /> },
      { path: 'blog', element: <Blog /> },
      { path: 'blog/:slug', element: <BlogPost /> },
      { path: 'terms', element: <Legal /> },
      { path: 'privacy', element: <Legal /> },
      { path: 'refund-policy', element: <Legal /> },
      // SEO landing pages use Occasion template
      { path: 'private-theatre-hyderabad', element: <Occasion /> },
      { path: 'private-theatre-kukatpally', element: <Occasion /> },
      { path: 'private-theatre-birthday-hyderabad', element: <Occasion /> },
      { path: 'private-theatre-for-couples', element: <Occasion /> },
      { path: 'anniversary-celebration-hyderabad', element: <Occasion /> },
      { path: 'date-night-hyderabad', element: <Occasion /> },
      { path: 'proposal-venue-hyderabad', element: <Occasion /> },
      { path: 'private-party-hall-hyderabad', element: <Occasion /> },
      { path: 'corporate-event-venue-hyderabad', element: <Occasion /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])
