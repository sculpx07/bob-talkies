import { http, HttpResponse, delay } from 'msw'
import { THEATRES, PACKAGES, ADDONS, OFFERS } from './seed'
import { addDays, format, parseISO, getDay } from 'date-fns'

const BASE = '/api/v1'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ok(data: any) {
  return HttpResponse.json(data)
}

function err(code: string, message: string, status = 400) {
  return HttpResponse.json({ code, message }, { status })
}

// Simulate realistic slot data
function generateSlots(theatreId: string, date: string) {
  const dow = getDay(parseISO(date)) // 0=Sun
  const isWeekend = dow === 0 || dow === 6
  const slots = [
    { id: `${theatreId}-${date}-1000`, start: '10:00', end: '12:30', status: 'available', pricePaise: isWeekend ? 179900 : 149900 },
    { id: `${theatreId}-${date}-1230`, start: '12:30', end: '15:00', status: 'available', pricePaise: isWeekend ? 179900 : 149900 },
    { id: `${theatreId}-${date}-1500`, start: '15:00', end: '17:30', status: 'high_demand', pricePaise: isWeekend ? 179900 : 149900 },
    { id: `${theatreId}-${date}-1730`, start: '17:30', end: '20:00', status: 'available', pricePaise: isWeekend ? 199900 : 169900 },
    { id: `${theatreId}-${date}-2000`, start: '20:00', end: '22:30', status: isWeekend ? 'high_demand' : 'available', pricePaise: isWeekend ? 219900 : 189900 },
    { id: `${theatreId}-${date}-2230`, start: '22:30', end: '01:00', status: 'available', pricePaise: isWeekend ? 199900 : 169900 },
  ]
  // Randomly mark one as booked for realism
  if (date.endsWith('15') || date.endsWith('22')) {
    slots[2].status = 'booked'
  }
  return slots
}

function generateCalendar(theatreId: string, month: string) {
  const [year, monthNum] = month.split('-').map(Number)
  const result: Array<{ date: string; status: string }> = []
  const daysInMonth = new Date(year, monthNum, 0).getDate()
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${String(monthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dow = getDay(new Date(date))
    const isWeekend = dow === 0 || dow === 6
    let status = 'available'
    if (d < new Date().getDate() && month === format(new Date(), 'yyyy-MM')) {
      status = 'unavailable'
    } else if (isWeekend && (d === 1 || d === 8 || d === 15 || d === 22)) {
      status = 'fully_booked'
    } else if (isWeekend) {
      status = 'high_demand'
    } else if (d % 7 === 0) {
      status = 'offer_date'
    }
    result.push({ date, status })
  }
  return result
}

let heldSlots: Record<string, { bookingId: string; expiresAt: string }> = {}
let bookings: Record<string, {
  id: string; status: string; theatreId: string; theatreName: string;
  packageId: string; packageName: string; date: string; slotId: string;
  slotStart: string; slotEnd: string; occasion: string; guests: number;
  addonIds: string[]; couponCode?: string; customerName: string;
  customerMobile: string; customerEmail?: string; totalPaise: number;
  advancePaidPaise: number; balancePaise: number; passToken?: string;
  createdAt: string; slotHoldExpiresAt?: string;
}> = {}

export const handlers = [
  // GET /theatres
  http.get(`${BASE}/theatres`, async () => {
    await delay(300)
    return ok(THEATRES.filter((t) => t.isActive))
  }),

  // GET /theatres/:slug
  http.get(`${BASE}/theatres/:slug`, async ({ params }) => {
    await delay(200)
    const t = THEATRES.find((x) => x.slug === params.slug)
    if (!t) return err('NOT_FOUND', 'Theatre not found', 404)
    return ok(t)
  }),

  // GET /packages
  http.get(`${BASE}/packages`, async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const theatreId = url.searchParams.get('theatreId')
    const pkgs = theatreId
      ? PACKAGES.filter((p) => p.theatreIds.includes(theatreId))
      : PACKAGES
    return ok(pkgs)
  }),

  // GET /addons
  http.get(`${BASE}/addons`, async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const theatreId = url.searchParams.get('theatreId')
    const addons = theatreId
      ? ADDONS.filter((a) => !a.theatreIds || a.theatreIds.includes(theatreId))
      : ADDONS
    return ok(addons)
  }),

  // GET /availability
  http.get(`${BASE}/availability`, async ({ request }) => {
    await delay(400)
    const url = new URL(request.url)
    const theatreId = url.searchParams.get('theatre')
    const date = url.searchParams.get('date')
    if (!theatreId || !date) return err('INVALID_PARAMS', 'theatre and date required')
    const slots = generateSlots(theatreId, date)
    return ok(slots)
  }),

  // GET /availability/calendar
  http.get(`${BASE}/availability/calendar`, async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const theatreId = url.searchParams.get('theatre')
    const month = url.searchParams.get('month')
    if (!theatreId || !month) return err('INVALID_PARAMS', 'theatre and month required')
    return ok(generateCalendar(theatreId, month))
  }),

  // POST /pricing/quote
  http.post(`${BASE}/pricing/quote`, async ({ request }) => {
    await delay(300)
    const body = await request.json() as {
      theatreId: string; packageId: string; date: string; slotId: string;
      guests: number; addonIds: string[]; couponCode?: string;
    }
    const theatre = THEATRES.find((t) => t.id === body.theatreId)
    const pkg = PACKAGES.find((p) => p.id === body.packageId)
    if (!theatre || !pkg) return err('NOT_FOUND', 'Theatre or package not found')

    const dow = getDay(parseISO(body.date))
    const isWeekend = dow === 0 || dow === 6
    const basePrise = isWeekend ? pkg.weekendPricePaise : pkg.pricePaise
    const extraGuests = Math.max(0, body.guests - pkg.includedGuests)
    const extraGuestCharge = extraGuests * theatre.extraGuestPricePaise
    const addonTotal = body.addonIds.reduce((sum, id) => {
      const addon = ADDONS.find((a) => a.id === id)
      return sum + (addon?.pricePaise ?? 0)
    }, 0)

    let discountPaise = 0
    let couponApplied: string | undefined
    if (body.couponCode) {
      const offer = OFFERS.find(
        (o) => o.code === body.couponCode && o.isActive,
      )
      if (offer) {
        const subtotal = basePrise + extraGuestCharge + addonTotal
        if (!offer.minOrderPaise || subtotal >= offer.minOrderPaise) {
          if (offer.discountType === 'flat') {
            discountPaise = offer.discountValue
          } else {
            discountPaise = Math.round((subtotal * offer.discountValue) / 100)
            if (offer.maxDiscountPaise) {
              discountPaise = Math.min(discountPaise, offer.maxDiscountPaise)
            }
          }
          couponApplied = body.couponCode
        }
      }
    }

    const subtotalPaise = basePrise + extraGuestCharge + addonTotal
    const taxPaise = Math.round((subtotalPaise - discountPaise) * 0.18)
    const totalPaise = subtotalPaise - discountPaise + taxPaise
    const advancePaise = Math.round(totalPaise * 0.3)

    return ok({
      lineItems: [
        { label: `${pkg.name} Package`, paise: basePrise },
        ...(extraGuests > 0 ? [{ label: `Extra Guests (${extraGuests} × ₹${theatre.extraGuestPricePaise / 100})`, paise: extraGuestCharge }] : []),
        ...body.addonIds.map((id) => {
          const addon = ADDONS.find((a) => a.id === id)
          return { label: addon?.name ?? id, paise: addon?.pricePaise ?? 0 }
        }),
        ...(discountPaise > 0 ? [{ label: `Coupon (${couponApplied})`, paise: -discountPaise }] : []),
        { label: 'GST (18%)', paise: taxPaise },
      ],
      totalPaise,
      advancePaise,
      balancePaise: totalPaise - advancePaise,
      couponApplied,
    })
  }),

  // POST /coupons/validate
  http.post(`${BASE}/coupons/validate`, async ({ request }) => {
    await delay(400)
    const body = await request.json() as { code: string; theatreId?: string }
    const offer = OFFERS.find((o) => o.code === body.code && o.isActive)
    if (!offer) return err('COUPON_INVALID', 'Invalid or expired coupon code', 400)
    if (offer.applicableTheatreIds && body.theatreId && !offer.applicableTheatreIds.includes(body.theatreId)) {
      return err('COUPON_NOT_APPLICABLE', 'This coupon is not valid for the selected theatre', 400)
    }
    return ok({ valid: true, offer })
  }),

  // POST /bookings
  http.post(`${BASE}/bookings`, async ({ request }) => {
    await delay(600)
    const body = await request.json() as {
      theatreId: string; packageId: string; date: string; slotId: string;
      occasion: string; guests: number; addonIds: string[]; couponCode?: string;
      customerName: string; customerMobile: string; customerEmail?: string;
    }
    const theatre = THEATRES.find((t) => t.id === body.theatreId)
    const pkg = PACKAGES.find((p) => p.id === body.packageId)
    if (!theatre || !pkg) return err('NOT_FOUND', 'Theatre or package not found', 404)

    const id = `BT${Date.now()}`
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    const slotParts = body.slotId.split('-')
    const slotTime = slotParts[slotParts.length - 1]
    const h = parseInt(slotTime.slice(0, 2))
    const m = slotTime.slice(2)
    const slotStart = `${String(h).padStart(2, '0')}:${m}`
    const endH = (h + 2) % 24
    const slotEnd = `${String(endH).padStart(2, '0')}:${m}`

    bookings[id] = {
      id, status: 'SLOT_HELD', theatreId: body.theatreId, theatreName: theatre.name,
      packageId: body.packageId, packageName: pkg.name, date: body.date,
      slotId: body.slotId, slotStart, slotEnd, occasion: body.occasion,
      guests: body.guests, addonIds: body.addonIds, couponCode: body.couponCode,
      customerName: body.customerName, customerMobile: body.customerMobile,
      customerEmail: body.customerEmail, totalPaise: theatre.startingPricePaise,
      advancePaidPaise: 0, balancePaise: theatre.startingPricePaise,
      createdAt: new Date().toISOString(), slotHoldExpiresAt: expiresAt,
    }
    return ok(bookings[id])
  }),

  // POST /bookings/:id/pay
  http.post(`${BASE}/bookings/:id/pay`, async ({ params }) => {
    await delay(400)
    const booking = bookings[params.id as string]
    if (!booking) return err('NOT_FOUND', 'Booking not found', 404)
    return ok({
      bookingId: booking.id,
      gatewayOrderId: `order_mock_${Date.now()}`,
      amount: booking.advancePaidPaise || Math.round(booking.totalPaise * 0.3),
      currency: 'INR',
      key: 'rzp_test_mock',
    })
  }),

  // GET /bookings/:id
  http.get(`${BASE}/bookings/:id`, async ({ params }) => {
    await delay(200)
    const booking = bookings[params.id as string]
    if (!booking) return err('NOT_FOUND', 'Booking not found', 404)
    // Auto-confirm in mock after a brief period
    if (booking.status === 'SLOT_HELD' || booking.status === 'PAYMENT_PENDING') {
      booking.status = 'CONFIRMED'
      booking.passToken = `pass_${booking.id}_${Date.now()}`
      booking.advancePaidPaise = Math.round(booking.totalPaise * 0.3)
      booking.balancePaise = booking.totalPaise - booking.advancePaidPaise
    }
    return ok(booking)
  }),

  // POST /bookings/:id/addons
  http.post(`${BASE}/bookings/:id/addons`, async ({ params, request }) => {
    await delay(300)
    const booking = bookings[params.id as string]
    if (!booking) return err('NOT_FOUND', 'Booking not found', 404)
    const body = await request.json() as { addonIds: string[] }
    booking.addonIds = [...new Set([...booking.addonIds, ...body.addonIds])]
    return ok(booking)
  }),

  // POST /bookings/:id/reschedule-request
  http.post(`${BASE}/bookings/:id/reschedule-request`, async ({ params }) => {
    await delay(400)
    const booking = bookings[params.id as string]
    if (!booking) return err('NOT_FOUND', 'Booking not found', 404)
    return ok({ success: true, message: 'Reschedule request received. Our team will contact you within 2 hours.' })
  }),

  // POST /bookings/:id/cancel-request
  http.post(`${BASE}/bookings/:id/cancel-request`, async ({ params }) => {
    await delay(400)
    const booking = bookings[params.id as string]
    if (!booking) return err('NOT_FOUND', 'Booking not found', 404)
    return ok({ success: true, message: 'Cancellation request submitted. Refund will be processed in 5-7 business days.' })
  }),

  // GET /passes/:token
  http.get(`${BASE}/passes/:token`, async ({ params }) => {
    await delay(200)
    const booking = Object.values(bookings).find((b) => b.passToken === params.token)
    if (!booking) return err('NOT_FOUND', 'Pass not found', 404)
    return ok({ ...booking, qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${booking.id}` })
  }),

  // POST /leads
  http.post(`${BASE}/leads`, async () => {
    await delay(500)
    return ok({ success: true, leadId: `lead_${Date.now()}` })
  }),

  // POST /track/event
  http.post(`${BASE}/track/event`, async () => {
    return ok({ success: true })
  }),

  // GET /c/:code (short links)
  http.get(`${BASE}/c/:code`, async ({ params }) => {
    return HttpResponse.redirect('/', 302)
  }),

  // GET /offers
  http.get(`${BASE}/offers`, async () => {
    await delay(200)
    return ok(OFFERS.filter((o) => o.isActive))
  }),

  // POST /auth/otp/request
  http.post(`${BASE}/auth/otp/request`, async () => {
    await delay(500)
    return ok({ success: true, expiresIn: 300 })
  }),

  // POST /auth/otp/verify
  http.post(`${BASE}/auth/otp/verify`, async ({ request }) => {
    await delay(400)
    const body = await request.json() as { mobile: string; otp: string }
    if (body.otp === '123456' || body.otp === '000000') {
      return ok({ token: `mock_token_${Date.now()}`, verified: true })
    }
    return err('OTP_INVALID', 'Invalid OTP. Use 123456 for testing.', 400)
  }),

  // GET /me/bookings
  http.get(`${BASE}/me/bookings`, async () => {
    await delay(400)
    return ok({ data: Object.values(bookings), total: Object.keys(bookings).length })
  }),

  // GET /reviews (mock)
  http.get(`${BASE}/reviews`, async () => {
    await delay(300)
    return ok({
      averageRating: 4.9,
      totalCount: 847,
      data: [
        { id: 'r1', name: 'Priya R.', rating: 5, text: 'Absolutely magical! Booked for my husband\'s birthday and the team went above and beyond. The decoration was stunning and the sound quality was incredible!', occasion: 'Birthday', theatreName: 'The Delight', date: '2024-11-10', avatar: '' },
        { id: 'r2', name: 'Arjun K.', rating: 5, text: 'Proposed here and she said yes! The setup was perfect — the staff helped me keep it a surprise. Highly recommend BOB Talkies for proposals!', occasion: 'Proposal', theatreName: 'Heavens', date: '2024-11-08', avatar: '' },
        { id: 'r3', name: 'Sneha M.', rating: 5, text: 'Our anniversary celebration was a dream. The Gold package exceeded all expectations. The cake was delicious and the photographer captured every moment beautifully!', occasion: 'Anniversary', theatreName: 'Filmdom', date: '2024-11-05', avatar: '' },
        { id: 'r4', name: 'Rahul T.', rating: 4, text: 'Great place for a group birthday party. We used The Cosmos for 15 friends and everyone loved it. The screen and sound are top-notch!', occasion: 'Birthday', theatreName: 'The Cosmos', date: '2024-10-28', avatar: '' },
        { id: 'r5', name: 'Deepika S.', rating: 5, text: 'Booked for my baby shower — 20 of us. The Vibe Hall was perfect! Great decor, amazing food, and the staff was so helpful throughout. Worth every rupee!', occasion: 'Baby Shower', theatreName: 'The Vibe Hall', date: '2024-10-20', avatar: '' },
      ],
    })
  }),
]
