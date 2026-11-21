import type { ReactNode } from 'react'
import { BarList } from '@/admin/components/charts'
import { Card, CardBody, CardHeader } from '@/admin/components/ui'
import { occasionLabel } from '@/admin/constants/catalog'
import { PAYMENT_METHOD_LABELS, SOURCE_LABELS } from '@/admin/features/bookings/constants'
import { LEAD_SOURCE_LABELS } from '@/admin/features/leads/constants'
import { formatTime } from '@/admin/lib/utils/date'
import { formatPaise } from '@/admin/lib/utils/money'
import type { ReportSummary } from '../types'
import { minutesLabel } from '../utils'

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader title={title} description={description} />
      <CardBody>{children}</CardBody>
    </Card>
  )
}

/** The "where did it come from" cards under the trend chart. */
export function BreakdownCards({ s }: { s: ReportSummary }) {
  const L = s.leads
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Section title="Theatres" description="Revenue, bookings and how full each theatre was.">
        <BarList
          rows={s.byTheatre.map((t) => ({
            key: t.theatre.id,
            label: t.theatre.name + (t.theatre.isActive ? '' : ' (inactive)'),
            value: t.revenuePaise,
            display: formatPaise(t.revenuePaise),
            hint: `${plural(t.bookings, 'booking')} · ${t.occupancy}% full (${t.bookings}/${t.sellableSlots} slots)`,
          }))}
        />
      </Section>

      <Section title="Popular start times" description="Bookings by slot start time.">
        <BarList
          rows={[...s.bySlotTime].sort((a, b) => b.bookings - a.bookings).map((t) => ({
            key: t.key,
            label: formatTime(t.key),
            value: t.bookings,
            display: plural(t.bookings, 'booking'),
          }))}
        />
      </Section>

      <Section title="Occasions">
        <BarList
          rows={s.byOccasion.map((o) => ({
            key: o.key ?? 'none',
            label: o.key ? occasionLabel(o.key) : 'Not given',
            value: o.bookings,
            display: plural(o.bookings, 'booking'),
            hint: formatPaise(o.revenuePaise),
          }))}
        />
      </Section>

      <Section title="Booking channels" description="Where bookings were made.">
        <BarList
          rows={s.bySource.map((o) => ({
            key: o.key,
            label: SOURCE_LABELS[o.key] ?? o.key,
            value: o.bookings,
            display: plural(o.bookings, 'booking'),
            hint: formatPaise(o.revenuePaise),
          }))}
        />
      </Section>

      <Section title="Top add-ons" description="By revenue. Cakes, decor, effects and gifts.">
        <BarList
          empty="No add-ons sold in this period"
          rows={s.topAddons.map((a) => ({
            key: a.name,
            label: a.name,
            value: a.revenuePaise,
            display: formatPaise(a.revenuePaise),
            hint: `${a.quantity} sold on ${plural(a.bookings, 'booking')}`,
          }))}
        />
      </Section>

      <Section title="Offers used" description="Coupon codes on sold bookings.">
        <BarList
          empty="No coupons used in this period"
          rows={s.offers.map((o) => ({
            key: o.code,
            label: <span className="font-mono">{o.code}</span>,
            value: o.uses,
            display: plural(o.uses, 'use'),
            hint: `${formatPaise(o.discountPaise)} discount · ${formatPaise(o.revenuePaise)} booked`,
          }))}
        />
      </Section>

      <Section title="Money received by method" description="Payments recorded in this period, by the day they came in.">
        <BarList
          empty="No payments received in this period"
          rows={s.paymentMethods.map((p) => ({
            key: p.method,
            label: PAYMENT_METHOD_LABELS[p.method] ?? p.method,
            value: p.amountPaise,
            display: formatPaise(p.amountPaise),
            hint: plural(p.count, 'payment'),
          }))}
        />
      </Section>

      <Section title="Leads" description="Enquiries received in this period and how many booked.">
        <dl className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {([
            ['Received', L.received - L.spam],
            ['Converted', L.converted],
            ['Conversion', `${L.conversionRate}%`],
            ['First reply', minutesLabel(L.avgFirstResponseMinutes)],
          ] as const).map(([label, value]) => (
            <div key={label} className="rounded-lg bg-slate-50 px-3 py-2">
              <dt className="text-xs text-slate-500">{label}</dt>
              <dd className="text-lg font-semibold tabular-nums text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
        <BarList
          empty="No enquiries in this period"
          rows={L.bySource.map((o) => ({
            key: o.key,
            label: LEAD_SOURCE_LABELS[o.key] ?? o.key,
            value: o.leads,
            display: plural(o.leads, 'lead'),
            hint: `${o.converted} converted (${o.conversionRate}%)`,
          }))}
        />
        {L.spam > 0 && <p className="mt-3 text-xs text-slate-500">{L.spam} spam {L.spam === 1 ? 'enquiry' : 'enquiries'} not counted.</p>}
      </Section>
    </div>
  )
}
