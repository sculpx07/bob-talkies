import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import {
  ArrowRight, Sparkles, ChevronDown, Check, MessageCircle,
  Upload, Film, Heart, Users, Gift, Star, Lightbulb,
} from 'lucide-react'
import { Seo } from '@/components/seo/Seo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { LeadSchema, type Lead } from '@/schemas/lead'
import { api } from '@/lib/api/client'
import { trackEvent } from '@/features/tracking/events'
import { getLastTouchUTM } from '@/features/tracking/utm'
import { config } from '@/lib/config'

// ─── Experience data ────────────────────────────────────────────────────────

const EXPERIENCES = [
  {
    id: 'memory-reel',
    num: '01',
    title: 'The Memory Reel',
    tagline: 'A Journey Called Life.',
    desc: 'A collection of personal memories — childhood, school, travel, friendships and family — displayed as a visual journey on the theatre screen.',
    screenLabel: '"A Journey Called Life"',
    color: '#a78bfa',
    icon: Film,
    img: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=900&q=80',
    screenImg: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80',
    items: ['Childhood photographs', 'School & college memories', 'Friendship moments', 'Family milestones', 'Travel memories', 'Short personal videos'],
  },
  {
    id: 'video-wishes',
    num: '02',
    title: 'Video Wishes from Loved Ones',
    tagline: 'Everyone. Even Those Far Away.',
    desc: 'Collect video messages from family, friends and loved ones from anywhere in the world and combine them into one surprise video played on the big screen.',
    screenLabel: '"Surprise Messages Just for You"',
    color: '#34d399',
    icon: Users,
    img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80',
    screenImg: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80',
    items: ['Parents\' video messages', 'Siblings\' wishes', 'Friends\' recorded greetings', 'Messages from abroad', 'Group video messages', 'A final surprise message'],
  },
  {
    id: 'big-proposal',
    num: '03',
    title: 'The Big Proposal',
    tagline: 'Will You Be Mine Forever?',
    desc: 'Turn your proposal into a cinematic experience. Display your love story, timeline and a personalised final question on the big screen.',
    screenLabel: '"Every story has a favourite chapter. Will you be mine forever?"',
    color: '#f43f5e',
    icon: Heart,
    img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=900&q=80',
    screenImg: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=900&q=80',
    items: ['Couple photographs', 'Relationship timeline', 'First meeting memories', 'Special dates & places', 'Romantic video montage', 'Personalised proposal message'],
  },
  {
    id: 'birthday-surprise',
    num: '04',
    title: 'Birthday Screen Surprise',
    tagline: 'Happy Birthday — You Are Loved.',
    desc: 'A personalised birthday video featuring childhood photos, funny memories, wishes from friends and family, and a grand birthday message.',
    screenLabel: '"Happy Birthday! You are loved more than you know."',
    color: '#fbbf24',
    icon: Gift,
    img: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=900&q=80',
    screenImg: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=900&q=80',
    items: ['Childhood photographs', 'Funny memories', 'Friends\' video wishes', 'Family messages', 'Birthday montage', 'Grand birthday reveal'],
  },
  {
    id: 'love-story',
    num: '05',
    title: 'Our Love Story',
    tagline: 'From the First Photo to Forever.',
    desc: 'Display a couple\'s journey — first photograph together, favourite memories, special dates and an anniversary message on the theatre screen.',
    screenLabel: '"Our Story, Our Screen"',
    color: '#f472b6',
    icon: Heart,
    img: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=900&q=80',
    screenImg: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80',
    items: ['First photograph together', 'First meeting memory', 'Favourite shared moments', 'Special dates & milestones', 'Travel and adventure photos', 'Personal video messages'],
  },
  {
    id: 'grand-reveal',
    num: '06',
    title: 'The Grand Announcement',
    tagline: 'Some News Deserves the Big Screen.',
    desc: 'From pregnancy announcements to retirement tributes — use the theatre screen to reveal something important and unforgettable.',
    screenLabel: '"We Have Something to Tell You..."',
    color: '#c9a84c',
    icon: Star,
    img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=80',
    screenImg: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=80',
    items: ['Pregnancy announcement', 'Engagement reveal', 'Graduation celebration', 'Retirement tribute', 'Achievement milestone', 'Special family surprise'],
  },
  {
    id: 'friendship-reunion',
    num: '07',
    title: 'Friendship & Reunion',
    tagline: 'Old Friends. New Memories.',
    desc: 'Celebrate friendships and reunions with a personalised montage of group photos, college memories and messages from people who\'ve meant the most.',
    screenLabel: '"Here\'s to the Best Crew Ever"',
    color: '#818cf8',
    icon: Users,
    img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80',
    screenImg: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80',
    items: ['Old group photographs', 'College & school memories', 'Funny shared videos', 'Reunion messages', 'Friends\' video wishes', 'Personalised group tribute'],
  },
  {
    id: 'custom-screen',
    num: '08',
    title: 'Your Custom Screen',
    tagline: 'Your Idea. Your Screen. Your Moment.',
    desc: 'Have your own unique idea? Bring your photos, videos, slideshows or presentations. Subject to supported formats and content approval.',
    screenLabel: '"Your Story, Your Way"',
    color: '#fb923c',
    icon: Lightbulb,
    img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900&q=80',
    screenImg: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900&q=80',
    items: ['Personal video playback', 'Photo slideshows', 'Custom text messages', 'Special presentations', 'Personalised celebration videos', 'Any approved custom content'],
  },
]

const STEPS = [
  { num: '01', title: 'Choose Your Surprise', desc: 'Explore the available ideas above, or bring your own concept and describe what you have in mind.', icon: Sparkles },
  { num: '02', title: 'Share Your Content', desc: 'Provide your photos, videos, messages and personalised text through the approved submission process.', icon: Upload },
  { num: '03', title: 'We Prepare Your Experience', desc: 'Our team reviews the submitted content and confirms playback requirements before your booking.', icon: Film },
  { num: '04', title: 'Watch the Magic', desc: 'Arrive, settle in, and experience your personalised surprise on the theatre\'s big screen.', icon: Star },
]

const SURPRISE_TYPES = [
  'Memory Reel', 'Birthday Surprise', 'Proposal Video', 'Video Wishes',
  'Love Story', 'Grand Announcement', 'Friendship Memories', 'Custom Idea',
]

const FAQS = [
  { q: 'Can I bring my own photos and videos?', a: 'Yes. You can submit your own photos and videos for display on the theatre screen. Formats and file size requirements will be confirmed when you enquire.' },
  { q: 'Can I play a video recorded by my friends?', a: 'Absolutely. We can screen videos recorded by friends and family as part of your personalised experience. Please enquire in advance so we can confirm format support.' },
  { q: 'Can I display a personalised message on the screen?', a: 'Yes. Personalised text messages and titles can be displayed on the screen. Share your message text when you submit your enquiry.' },
  { q: 'Can I surprise someone with a proposal video?', a: 'Yes. The Big Proposal is one of our most popular personalised experiences. We recommend enquiring early to plan the sequence and content.' },
  { q: 'Can people from another city send video wishes?', a: 'Yes. Friends and family from anywhere can record and send their video messages. You collect the videos and submit them together as part of your content package.' },
  { q: 'What video formats are supported?', a: 'We support common formats such as MP4. Specific format and resolution requirements will be confirmed when you enquire about your personalised experience.' },
  { q: 'How early should I submit my content?', a: 'We recommend submitting content at least 3–5 days before your booking to allow time for review and preparation. Please enquire for exact timelines.' },
  { q: 'Can I bring my own custom surprise idea?', a: 'Yes. If you have an idea that isn\'t listed above, please describe it in your enquiry and we\'ll let you know what\'s possible.' },
  { q: 'Is video editing included or do I need to prepare the video?', a: 'Please enquire. Currently, customers are advised to prepare their own edited videos for submission. If you need guidance on what to prepare, we\'re happy to advise.' },
  { q: 'Are there additional charges for personalised screen experiences?', a: 'Charges depend on the type of personalised experience and content involved. Please enquire for a detailed breakdown specific to your request.' },
]

// ─── Theatre Screen Mockup ──────────────────────────────────────────────────

function TheatreScreenMockup({ activeImg, screenLabel }: { activeImg: string; screenLabel: string }) {
  return (
    <div className="relative w-full" style={{ aspectRatio: '16/10' }}>
      {/* Theatre dark frame */}
      <div
        className="absolute inset-0 rounded-3xl overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#0a0210 0%,#120420 100%)' }}
      >
        {/* Audience silhouettes */}
        <div className="absolute bottom-0 left-0 right-0 h-[28%]"
          style={{ background: 'linear-gradient(to top, rgba(5,1,10,0.95), transparent)' }}
        >
          {/* simple silhouette row */}
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around px-4 pb-1">
            {[18,22,16,24,20,22,17,21,19].map((h, i) => (
              <div key={i} className="rounded-t-full bg-[#0a0210]/80" style={{ width: 24, height: h }} />
            ))}
          </div>
        </div>

        {/* Screen area */}
        <div className="absolute top-[8%] left-[6%] right-[6%] bottom-[30%] rounded-xl overflow-hidden"
          style={{ boxShadow: '0 0 60px rgba(201,168,76,0.08), 0 0 20px rgba(255,255,255,0.05)' }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={activeImg}
              src={activeImg}
              alt="Theatre screen preview"
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          </AnimatePresence>
          {/* Screen overlay with text */}
          <div
            className="absolute inset-0 flex items-end pb-4 px-4"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }}
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={screenLabel}
                className="text-white/80 text-xs font-medium italic text-center w-full"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                {screenLabel}
              </motion.p>
            </AnimatePresence>
          </div>
          {/* Subtle screen glow */}
          <div className="absolute inset-0 rounded-xl ring-1 ring-white/5" />
        </div>

        {/* Stage spotlights */}
        <div className="pointer-events-none absolute top-0 left-[20%] w-32 h-32 rounded-full bg-[#c9a84c]/4 blur-2xl" />
        <div className="pointer-events-none absolute top-0 right-[20%] w-32 h-32 rounded-full bg-[#c9a84c]/4 blur-2xl" />
      </div>
    </div>
  )
}

// ─── FAQ Item ───────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[#f0e6cc] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-4 text-left"
      >
        <span className="text-[#2a0e4f] font-semibold text-sm">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0 mt-0.5">
          <ChevronDown size={16} className="text-[#5b4578]" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-[#5b4578] text-sm leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Enquiry Form ────────────────────────────────────────────────────────────

function EnquiryForm() {
  const [submitted, setSubmitted] = useState(false)
  const [selectedSurpriseType, setSelectedSurpriseType] = useState('')
  const [hasMedia, setHasMedia] = useState<'yes' | 'no' | 'partly' | ''>('')
  const { toast } = useToast()

  const { register, handleSubmit, formState: { errors } } = useForm<Lead>({
    resolver: zodResolver(LeadSchema),
    defaultValues: { consentWhatsapp: true },
  })

  const { mutate: submitLead, isPending } = useMutation({
    mutationFn: (data: Lead) => {
      const utmData = getLastTouchUTM()
      return api.post('/leads', {
        ...data,
        source: 'personalise_page',
        utmSource: utmData?.utm_source,
        utmMedium: utmData?.utm_medium,
        utmCampaign: utmData?.utm_campaign,
      })
    },
    onSuccess: () => {
      setSubmitted(true)
      trackEvent('generate_lead', { source: 'personalise_page' })
    },
    onError: () => toast('error', 'Failed to submit', 'Please try again or reach us on WhatsApp.'),
  })

  function onSubmit(data: Lead) {
    const extraInfo = [
      selectedSurpriseType ? `Surprise Type: ${selectedSurpriseType}` : '',
      hasMedia ? `Has media ready: ${hasMedia}` : '',
      data.message,
    ].filter(Boolean).join('\n')
    submitLead({ ...data, occasion: selectedSurpriseType || data.occasion, message: extraInfo })
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16 px-6"
      >
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full mb-4"
          style={{ background: 'rgba(201,168,76,0.15)', border: '2px solid rgba(201,168,76,0.4)' }}>
          <Check size={28} className="text-[#c9a84c]" />
        </div>
        <h3 className="text-[#2a0e4f] font-black text-xl mb-2">We've Received Your Idea!</h3>
        <p className="text-[#5b4578] text-sm max-w-sm mx-auto">
          Our team will get back to you within 24 hours to discuss your surprise experience. In the meantime, feel free to WhatsApp us.
        </p>
        <a
          href={`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent("Hi! I've submitted a personalised surprise idea and would like to discuss further.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-black text-white"
          style={{ background: '#25d366' }}
        >
          <MessageCircle size={16} /> Continue on WhatsApp
        </a>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[#5b4578] mb-1.5">Your Name *</label>
          <Input {...register('name')} placeholder="Full name" error={errors.name?.message} />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[#5b4578] mb-1.5">Phone Number *</label>
          <Input {...register('mobile')} placeholder="10-digit mobile number" error={errors.mobile?.message} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-[#5b4578] mb-2">Type of Surprise</label>
        <div className="flex flex-wrap gap-2">
          {SURPRISE_TYPES.map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedSurpriseType(selectedSurpriseType === type ? '' : type)}
              className="rounded-full px-3 py-1.5 text-xs font-semibold transition-all"
              style={
                selectedSurpriseType === type
                  ? { background: 'linear-gradient(135deg,#c9a84c,#eed98a 50%,#c9a84c)', color: '#2a0e4f' }
                  : { background: '#f5eddf', color: '#5b4578', border: '1px solid #e6d5b8' }
              }
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[#5b4578] mb-1.5">Preferred Date</label>
          <Input type="date" {...register('email')} placeholder="Select date"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[#5b4578] mb-2">Do you have photos/videos ready?</label>
          <div className="flex gap-2 flex-wrap">
            {(['yes', 'no', 'partly'] as const).map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => setHasMedia(hasMedia === opt ? '' : opt)}
                className="rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-all"
                style={
                  hasMedia === opt
                    ? { background: 'linear-gradient(135deg,#c9a84c,#eed98a 50%,#c9a84c)', color: '#2a0e4f' }
                    : { background: '#f5eddf', color: '#5b4578', border: '1px solid #e6d5b8' }
                }
              >
                {opt === 'partly' ? 'Partly ready' : opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-[#5b4578] mb-1.5">Describe Your Idea *</label>
        <Textarea
          {...register('message')}
          placeholder="Tell us about your surprise idea — the occasion, who it's for, any specific content you have in mind..."
          rows={4}
          error={errors.message?.message}
        />
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isPending}
        className="w-full !bg-[#2a0e4f] !text-white !rounded-full hover:!bg-[#3d1575]"
      >
        {isPending ? 'Submitting…' : 'Submit My Surprise Idea'}
        {!isPending && <ArrowRight size={16} />}
      </Button>

      <p className="text-center text-[#5b4578]/50 text-xs">
        Our team will review your idea and get back to you within 24 hours.
      </p>
    </form>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function PersonalisePage() {
  const [activeExpId, setActiveExpId] = useState('memory-reel')
  const activeExp = EXPERIENCES.find(e => e.id === activeExpId) ?? EXPERIENCES[0]

  const heroRef = useRef(null)
  const expRef = useRef(null)
  const expInView = useInView(expRef, { once: true, margin: '-80px' })
  const stepsRef = useRef(null)
  const stepsInView = useInView(stepsRef, { once: true, margin: '-80px' })
  const formRef = useRef(null)
  const formInView = useInView(formRef, { once: true, margin: '-80px' })
  const faqRef = useRef(null)
  const faqInView = useInView(faqRef, { once: true, margin: '-80px' })
  const ctaRef = useRef(null)
  const ctaInView = useInView(ctaRef, { once: true, margin: '-80px' })

  return (
    <>
      <Seo
        title="Personalise Your Surprise | BOB Talkies — Private Theatre Hyderabad"
        description="Create unforgettable personalised screen experiences at BOB Talkies — from birthday surprises and proposals to memory reels and video wishes on the big private theatre screen."
        canonical="/personalise"
      />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
        style={{ background: 'linear-gradient(160deg,#0d0420 0%,#1a0640 50%,#0d0420 100%)' }}
      >
        {/* Cinematic background */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&q=70"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-20"
            aria-hidden="true"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,4,32,0.6) 0%, rgba(13,4,32,0.4) 50%, rgba(13,4,32,0.95) 100%)' }} />
        </div>

        {/* Ambient glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[300px] rounded-full bg-[#f472b6]/10 blur-3xl -translate-x-1/2" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-[#a78bfa]/8 blur-3xl translate-x-1/2" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles size={16} className="text-[#d4a94a]" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-[#c9a84c]">Personalise Your Surprise</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              Make the Big Screen
              <br />
              <span className="text-[#c9a84c]">All About You.</span>
            </h1>
            <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
              Your memories, your messages, your surprises. Turn a private theatre into a screen filled with emotions, stories and unforgettable moments.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#explore"
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-black text-[#2a0e4f] transition-all hover:brightness-110 hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#c9a84c,#eed98a 50%,#c9a84c)' }}
              >
                Explore Surprise Ideas <ArrowRight size={14} />
              </a>
              <a
                href="#enquiry"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-sm font-semibold text-white/80 hover:bg-white/10 transition-colors"
              >
                <MessageCircle size={14} /> Enquire Now
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Experience Showcase ──────────────────────────────────────────── */}
      <section
        id="explore"
        ref={expRef}
        className="py-16 md:py-24 scroll-mt-20"
        style={{ background: 'linear-gradient(160deg,#2a0e4f 0%,#32105f 55%,#2a0e4f 100%)' }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={expInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles size={15} className="text-[#d4a94a]" />
              <p className="font-cursive text-xl text-[#c9933a]">Explore Ideas</p>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white">What Can You Show on the Big Screen?</h2>
            <motion.div
              className="mx-auto mt-3 h-[3px] rounded-full bg-[#d4a94a]"
              initial={{ width: 0 }}
              animate={expInView ? { width: 40 } : {}}
              transition={{ delay: 0.3, duration: 0.5 }}
            />
          </motion.div>

          {/* Interactive layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-6 lg:gap-10 items-start">

            {/* Left: experience list */}
            <div className="space-y-2">
              {EXPERIENCES.map((exp, i) => {
                const isActive = activeExpId === exp.id
                const Icon = exp.icon
                return (
                  <motion.button
                    key={exp.id}
                    id={exp.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={expInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.05 * i, duration: 0.4 }}
                    onClick={() => setActiveExpId(exp.id)}
                    className="w-full text-left rounded-2xl border transition-all duration-200 p-4"
                    style={
                      isActive
                        ? { background: 'rgba(255,255,255,0.1)', borderColor: `${exp.color}50` }
                        : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }
                    }
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-black text-white/30 mt-0.5 w-5 shrink-0">{exp.num}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon size={13} style={{ color: exp.color }} />
                          <span className={`font-bold text-sm ${isActive ? 'text-white' : 'text-white/70'}`}>{exp.title}</span>
                        </div>
                        <AnimatePresence>
                          {isActive && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <p className="text-white/50 text-xs leading-relaxed mb-2">{exp.desc}</p>
                              <div className="flex flex-wrap gap-1">
                                {exp.items.map(item => (
                                  <span
                                    key={item}
                                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                                    style={{ background: `${exp.color}18`, color: exp.color }}
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: exp.color }} />
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {/* Right: theatre screen preview */}
            <div className="sticky top-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={expInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <TheatreScreenMockup activeImg={activeExp.screenImg} screenLabel={activeExp.screenLabel} />

                {/* Experience details below screen */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeExpId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                    className="mt-5 p-5 rounded-2xl border border-white/10"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="inline-flex items-center rounded-full text-[10px] font-black uppercase tracking-widest px-2 py-0.5"
                        style={{ background: `${activeExp.color}20`, color: activeExp.color }}
                      >
                        Experience {activeExp.num}
                      </span>
                    </div>
                    <h3 className="text-white font-black text-lg mb-1">{activeExp.title}</h3>
                    <p className="text-white/55 text-sm leading-relaxed mb-4">{activeExp.tagline}</p>
                    <a
                      href="#enquiry"
                      className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-black text-[#2a0e4f] transition-all hover:brightness-110"
                      style={{ background: 'linear-gradient(135deg,#c9a84c,#eed98a 50%,#c9a84c)' }}
                    >
                      Plan This Surprise <ArrowRight size={12} />
                    </a>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section
        ref={stepsRef}
        className="py-16 md:py-24"
        style={{ background: 'linear-gradient(180deg,#fffaf4 0%,#fdf5e8 100%)' }}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={stepsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <p className="font-cursive text-xl text-[#c9933a] mb-0.5">Simple Process</p>
            <h2 className="text-2xl md:text-3xl font-black text-[#2a0e4f]">How It Works</h2>
            <motion.div
              className="mx-auto mt-3 h-[3px] rounded-full bg-[#d4a94a]"
              initial={{ width: 0 }}
              animate={stepsInView ? { width: 40 } : {}}
              transition={{ delay: 0.3, duration: 0.5 }}
            />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 24 }}
                  animate={stepsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.1 * i, duration: 0.45 }}
                  className="relative flex flex-col items-center text-center p-6 rounded-3xl border border-[#f0e6cc] bg-white/70"
                  style={{ boxShadow: '0 2px 12px rgba(42,14,79,0.05)' }}
                >
                  <div
                    className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-4"
                    style={{ background: 'linear-gradient(135deg,rgba(201,168,76,0.15),rgba(212,169,74,0.08))', border: '1px solid rgba(201,168,76,0.3)' }}
                  >
                    <Icon size={22} className="text-[#c9a84c]" strokeWidth={1.8} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c9a84c] mb-2">Step {step.num}</span>
                  <h3 className="font-black text-[#2a0e4f] text-base mb-2">{step.title}</h3>
                  <p className="text-[#5b4578] text-sm leading-relaxed">{step.desc}</p>
                  {/* Connector */}
                  {i < 3 && (
                    <div className="hidden lg:block absolute top-14 -right-3 w-6 h-px bg-[#c9a84c]/30" />
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Enquiry Form ─────────────────────────────────────────────────── */}
      <section
        id="enquiry"
        ref={formRef}
        className="py-16 md:py-24 scroll-mt-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#2a0e4f 0%,#32105f 55%,#2a0e4f 100%)' }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#c9a84c]/7 blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-[#8e39c7]/10 blur-3xl -translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative max-w-2xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={formInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <div className="flex items-center justify-center gap-2 mb-0.5">
              <Sparkles size={15} className="text-[#d4a94a]" />
              <p className="font-cursive text-xl text-[#c9933a]">Get in Touch</p>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white leading-snug">
              Have a Surprise in Mind?<br />
              <span className="text-[#c9a84c]">Let's Make It Special.</span>
            </h2>
            <motion.div
              className="mx-auto mt-3 h-[3px] rounded-full bg-[#d4a94a]"
              initial={{ width: 0 }}
              animate={formInView ? { width: 40 } : {}}
              transition={{ delay: 0.3, duration: 0.5 }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={formInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="rounded-3xl border border-white/10 p-6 md:p-8"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <EnquiryForm />
          </motion.div>
        </div>
      </section>

      {/* ── FAQs ─────────────────────────────────────────────────────────── */}
      <section
        ref={faqRef}
        className="py-16 md:py-24"
        style={{ background: 'linear-gradient(180deg,#fffaf4 0%,#fdf5e8 100%)' }}
      >
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={faqInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <p className="font-cursive text-xl text-[#c9933a] mb-0.5">Common Questions</p>
            <h2 className="text-2xl md:text-3xl font-black text-[#2a0e4f]">Frequently Asked Questions</h2>
            <motion.div
              className="mx-auto mt-3 h-[3px] rounded-full bg-[#d4a94a]"
              initial={{ width: 0 }}
              animate={faqInView ? { width: 40 } : {}}
              transition={{ delay: 0.3, duration: 0.5 }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={faqInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="rounded-3xl border border-[#f0e6cc] bg-white/70 overflow-hidden px-6 py-2"
            style={{ boxShadow: '0 4px 20px rgba(42,14,79,0.07)' }}
          >
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section
        ref={ctaRef}
        className="py-16 md:py-24 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#0d0420 0%,#1a0640 50%,#0d0420 100%)' }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=1200&q=50"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-10"
            aria-hidden
          />
          <div className="absolute inset-0 bg-[#0d0420]/80" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <Sparkles size={28} className="text-[#c9a84c] mx-auto mb-4" />
            <h2 className="font-display text-3xl md:text-4xl font-black text-white leading-tight mb-4">
              Some Surprises Deserve the Big Screen.
            </h2>
            <p className="text-white/55 text-base max-w-md mx-auto mb-10">
              Bring your memories. Bring your idea. We'll help you make the moment special.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#enquiry"
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-black text-[#2a0e4f] transition-all hover:brightness-110 hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#c9a84c,#eed98a 50%,#c9a84c)' }}
              >
                Plan My Surprise <ArrowRight size={14} />
              </a>
              <Link
                to="/"
                state={{ highlightPlan: true }}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-sm font-semibold text-white/80 hover:bg-white/10 transition-colors"
              >
                Book My Theatre <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
