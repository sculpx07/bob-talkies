import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlbumViewer } from '@/components/ui/AlbumViewer'
import { Seo } from '@/components/seo/Seo'
import { PageShell, SectionHeader } from '@/components/layout/PageShell'
import { cn } from '@/lib/utils/cn'

// Every menu uses the same diamond mosaic: columns of 1 | 2 | 3 | 2 | 1 squares (9 photos)
const PYRAMID = [1, 2, 3, 2, 1]
const TILE_COUNT = 9

const CATEGORIES = ['All', 'Birthday', 'Anniversary', 'Couple', 'Proposal', 'Friends', 'Family', 'Decoration', 'Cake Cutting']

// Free Pexels photos, nine per menu, each chosen to match its title.
const px = (id: number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=600`

const PHOTOS: Record<string, Array<[number, string]>> = {
  Birthday: [
    [19310813, 'Birthday cake with candles and flowers'], [9319090, 'Happy Birthday cake with lit candles'],
    [1684039, 'Birthday cake topped with fruit and candles'], [1729808, 'Strawberry birthday cake with sparklers'],
    [3831785, 'Lighting the candles on a birthday cake'], [34379753, 'First birthday celebration with balloons'],
    [5804898, 'Friends celebrating a birthday together'], [7221139, "Family celebrating a baby's birthday"],
    [35445912, 'Joyful family at a birthday party'],
  ],
  Anniversary: [
    [2950327, 'Couple at a candlelight dinner'], [6670571, 'Candlelit dinner for two'],
    [5018974, 'Couple sharing a romantic table'], [5870784, 'Couple toasting by the fireplace'],
    [6581054, 'Couple clinking champagne glasses'], [6270012, 'Elegant couple with champagne'],
    [20046322, 'Anniversary gift surrounded by roses'], [20755030, 'Heart made of red roses'],
    [2950331, 'Couple in a candlelit room'],
  ],
  Couple: [
    [32074833, 'Romantic couple holding hands outdoors'], [3608797, 'Couple holding hands'],
    [2914629, "Couple holding each other's hands"], [28961735, 'Couple holding hands in nature'],
    [7718776, 'Couple face to face holding hands'], [19132635, 'Couple holding hands at sunset'],
    [3156992, 'Couple about to kiss'], [7234244, 'Couple watching a movie together'],
    [7991529, 'Couple in 3D glasses at the cinema'],
  ],
  Proposal: [
    [11643622, 'Man kneeling and proposing with a ring'], [16662071, 'Proposal at sunset'],
    [18612640, 'Proposal in front of a church'], [3038145, 'Man on one knee proposing'],
    [2057692, 'Man kneeling in front of a woman'], [8296802, 'Bride and groom celebrating'],
    [9451129, 'Putting on an engagement ring'], [11804720, 'Showing off the wedding ring'],
    [6408285, 'Presenting the ring to a girlfriend'],
  ],
  Friends: [
    [7149169, 'Friends laughing together'], [9287491, 'Group of friends laughing outdoors'],
    [23495690, 'Friends taking a selfie'], [708392, 'Friends having fun in the sun'],
    [10578428, 'Friends having fun at a party'], [6174129, 'Friends toasting their drinks'],
    [5935230, 'Friends cheering on a terrace'], [8263314, 'Friends watching a movie'],
    [6224647, 'Friends enjoying a party together'],
  ],
  Family: [
    [8944023, 'A happy family together'], [7982221, 'Happy family close together'],
    [4262173, 'Family having dinner and celebrating'], [4262170, 'Family dinner celebration'],
    [5778904, 'Family Christmas dinner'], [5591173, 'Family at the table'],
    [12788649, 'Family watching TV together'], [12788382, 'Family with a son on the sofa'],
    [5813746, 'Family on the sofa watching TV'],
  ],
  Decoration: [
    [226737, 'Decorative balloons hanging indoors'], [3371094, 'Floating shiny balloons'],
    [3905884, 'Pastel coloured balloons'], [3905855, 'Colourful pastel balloons'],
    [18393303, 'Party hat and garland decoration'], [1764089, 'String lights and baubles'],
    [2370726, 'Glowing white string lights'], [573298, 'Girl holding string lights'],
    [281417, 'Woman holding string lights'],
  ],
  'Cake Cutting': [
    [16124465, 'Woman cutting a birthday cake'], [11467417, 'Woman in red holding a cake'],
    [16856886, 'Placing a cake on the table'], [7600418, 'Hand slicing a cake'],
    [20002701, 'Woman standing beside her birthday cake'], [7826306, 'Woman blowing out her birthday cake'],
    [19458709, 'Woman with a birthday cake'], [6006320, 'Smiling woman with a slice of cake'],
    [7525182, 'Decorated cake and cupcakes'],
  ],
}

const GALLERY_IMAGES = Object.entries(PHOTOS).flatMap(([category, list]) =>
  list.map(([id, alt]) => ({ src: px(id), alt, category })),
)

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [albumIndex, setAlbumIndex] = useState<number | null>(null)

  // Each menu shows its own 9 photos. "All" takes one from every menu in turn.
  const filtered =
    activeCategory === 'All'
      ? Array.from({ length: TILE_COUNT }, (_, k) => PHOTOS[CATEGORIES[1 + (k % (CATEGORIES.length - 1))]][Math.floor(k / (CATEGORIES.length - 1))])
          .map(([id, alt]) => GALLERY_IMAGES.find((g) => g.src === px(id) && g.alt === alt)!)
      : GALLERY_IMAGES.filter((i) => i.category === activeCategory).slice(0, TILE_COUNT)

  return (
    <>
      <Seo
        title="Gallery | BOB Talkies Private Theatre"
        description="See photos and videos from real celebrations at BOB Talkies — birthdays, anniversaries, proposals and more."
        canonical="/gallery"
      />
      <PageShell>
        <SectionHeader
          eyebrow="Sweet Memories"
          eyebrowClassName="font-cursive normal-case tracking-normal text-3xl md:text-4xl font-semibold text-[#6b2398]"
          title="Our Captured Moment BOB Talkies"
          titleClassName="text-3xl md:text-5xl font-semibold"
          centered
        />

        {/* Category tabs */}
        <div className="mb-10 flex justify-center">
          <div
            role="tablist"
            aria-label="Gallery categories"
            className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-[#ecd9ec] bg-white/75 p-1.5 shadow-[0_10px_30px_rgba(107,35,152,0.12)] backdrop-blur [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat
              return (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={active}
                  onClick={() => { setActiveCategory(cat); setAlbumIndex(null) }}
                  className={cn(
                    'whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300',
                    active
                      ? 'bg-[linear-gradient(135deg,#6b2398,#d946ef)] text-white shadow-[0_8px_20px_rgba(107,35,152,0.35)]'
                      : 'text-[#32105f] hover:bg-[#f6e6ef]',
                  )}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* Same diamond mosaic for every menu: every photo shown once */}
        {filtered.length > 0 && (() => {
          const sizes = PYRAMID
          let slot = 0
          return (
            <div
              key={activeCategory}
              className="mx-auto grid max-w-[1320px] items-center gap-1.5 md:gap-3"
              style={{ gridTemplateColumns: `repeat(${sizes.length}, minmax(0, 1fr))` }}
            >
              {sizes.map((size, ci) => (
                <div key={ci} className="flex flex-col gap-1.5 md:gap-3">
                  {Array.from({ length: size }, (_, k) => {
                    const i = slot++
                    const img = filtered[i]
                    return (
                      <motion.button
                        key={`${activeCategory}-${i}`}
                        type="button"
                        initial={{ opacity: 0, y: 36, scale: 0.92 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, margin: '0px 0px -40px 0px' }}
                        transition={{ duration: 0.7, delay: ci * 0.1 + k * 0.06, ease: [0.22, 1, 0.36, 1] }}
                        whileHover={{ y: -6, scale: 1.04 }}
                        className="group relative aspect-square w-full overflow-hidden rounded-xl shadow-[0_10px_26px_rgba(107,35,152,0.16)] focus-visible:outline-2 focus-visible:outline-[#c026d3] md:rounded-2xl"
                        onClick={() => setAlbumIndex(i)}
                        aria-label={`View ${img.alt}`}
                      >
                        <img
                          src={img.src}
                          alt={img.alt}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                        />
                      </motion.button>
                    )
                  })}
                </div>
              ))}
            </div>
          )
        })()}

        {/* Album viewer */}
        <AlbumViewer photos={filtered} index={albumIndex} onClose={() => setAlbumIndex(null)} onChange={setAlbumIndex} />
      </PageShell>
    </>
  )
}
