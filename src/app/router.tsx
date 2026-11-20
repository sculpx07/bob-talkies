import { lazy, Suspense } from 'react'
import { createBrowserRouter, Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { SavedDrawer } from '@/components/layout/SavedDrawer'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomBar } from '@/components/layout/MobileBottomBar'
import { WhatsAppFab } from '@/components/layout/WhatsAppFab'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
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
const VibeHall = lazy_(() => import('@/pages/vibe-hall/VibeHallPage'))
const Faq = lazy_(() => import('@/pages/faq/FaqPage'))
const Blog = lazy_(() => import('@/pages/blog/BlogPage'))
const BlogPost = lazy_(() => import('@/pages/blog-post/BlogPostPage'))
const Legal = lazy_(() => import('@/pages/legal/LegalPage'))
const Personalise = lazy_(() => import('@/pages/personalise/PersonalisePage'))
const Rewards = lazy_(() => import('@/pages/rewards/RewardsPage'))
const NotFound = lazy_(() => import('@/pages/not-found/NotFoundPage'))

/* Desktop background: bg.png repeated down the page, every other copy flipped
   vertically so neighbouring copies join seamlessly.
   bg.png (1024x1536) has coloured wave artwork along its top edge (rows 0-30%) and
   bottom edge (rows 86-100%). Mirroring those edges at every join made large
   purple/orange blob shapes mid-page, so only the top of the first copy keeps its
   artwork (the hero) and every join uses the calm rows 30%-86% instead:
     copy 0   : rows 0-86%      (hero artwork on top, cream at the bottom)
     copy 1+  : rows 30%-86%    (alternately flipped, so every join is plain cream) */
const BG_ROWS_END = 0.86
const BG_ROWS_START = 0.3
function PageBackground() {
  const firstH = 1536 * BG_ROWS_END
  const bandH = 1536 * (BG_ROWS_END - BG_ROWS_START)
  // vertical background-position (%) that puts row BG_ROWS_START of the image at the top of a band
  const bandPosY = ((1536 * BG_ROWS_START) / (1536 - bandH)) * 100
  return (
    <div className="hidden md:block absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      {Array.from({ length: 24 }, (_, i) => (
        <div
          key={i}
          style={{
            aspectRatio: i === 0 ? `1024 / ${firstH}` : `1024 / ${bandH}`,
            backgroundImage: "url('/bg.png')",
            backgroundSize: '100% auto',
            backgroundPosition: i === 0 ? 'center top' : `center ${bandPosY}%`,
            transform: i % 2 ? 'scaleY(-1)' : undefined,
          }}
        />
      ))}
    </div>
  )
}

function RootLayout() {
  return (
    <ErrorBoundary>
      <div className="relative isolate">
        <PageBackground />
        <Header />
        <SavedDrawer />
        <Outlet />
        <Footer />
        <MobileBottomBar />
        <WhatsAppFab />
        <ScrollToTop />
        <ScrollRestoration />
      </div>
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
      { path: 'vibe-hall', element: <VibeHall /> },
      { path: 'faq', element: <Faq /> },
      { path: 'blog', element: <Blog /> },
      { path: 'blog/:slug', element: <BlogPost /> },
      { path: 'personalise', element: <Personalise /> },
      { path: 'rewards', element: <Rewards /> },
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
