export type FaqCategory =
  | 'booking' | 'payment' | 'cancellation' | 'theatre' | 'food'
  | 'decorations' | 'cakes' | 'ott' | 'guests' | 'parking' | 'timings' | 'rescheduling'

export interface Faq {
  id: string
  question: string
  answer: string
  category: FaqCategory
}

export const FAQS: Faq[] = [
  // Booking
  { id: 'b1', category: 'booking', question: 'How do I book a private theatre at BOB Talkies?', answer: 'You can book directly on our website in under 5 minutes. Choose your occasion, select guests, pick a date and theatre, customise your package and pay the advance. No calls needed!' },
  { id: 'b2', category: 'booking', question: 'How far in advance should I book?', answer: 'We recommend booking at least 24–48 hours in advance for weekdays and 3–5 days for weekends, as slots fill up quickly. For special occasions with custom decorations, 72 hours minimum is ideal.' },
  { id: 'b3', category: 'booking', question: 'Can I pre-select the movie or content?', answer: 'You can connect your personal streaming accounts (Netflix, Prime, Hotstar, YouTube) via HDMI. We do not pre-load specific movies due to licensing restrictions.' },
  { id: 'b4', category: 'booking', question: 'What information do I need to provide while booking?', answer: 'You\'ll need your name, mobile number, occasion type, number of guests, preferred date and time slot. Mobile OTP verification is required to confirm your booking.' },
  { id: 'b5', category: 'booking', question: 'Can I book for someone else as a gift?', answer: 'Yes! You can book on behalf of someone else. Add a special note in the instructions and we\'ll help personalise it as a gift.' },
  // Payment
  { id: 'p1', category: 'payment', question: 'How much advance do I need to pay?', answer: 'You need to pay 30% of the total amount as an advance to confirm your booking. The remaining 70% is paid at the venue before your session.' },
  { id: 'p2', category: 'payment', question: 'What payment methods do you accept?', answer: 'We accept all UPI apps (GPay, PhonePe, Paytm), debit and credit cards, and net banking via our secure Razorpay payment gateway.' },
  { id: 'p3', category: 'payment', question: 'Is my payment secure?', answer: 'Yes. All payments are processed via Razorpay, which is PCI-DSS compliant. We never store your card details.' },
  { id: 'p4', category: 'payment', question: 'Will I get a receipt after payment?', answer: 'Yes, you\'ll receive a booking confirmation via SMS and WhatsApp with full payment details. You can also download your invoice from the My Booking section.' },
  // Cancellation
  { id: 'c1', category: 'cancellation', question: 'What is the cancellation policy?', answer: 'Cancellations made 48+ hours before the booking time receive a 100% refund. 24–48 hours: 50% refund. Less than 24 hours: no refund. All refunds are processed within 5–7 business days.' },
  { id: 'c2', category: 'cancellation', question: 'How do I cancel my booking?', answer: 'You can submit a cancellation request from your My Booking page or by contacting us on WhatsApp. Our team will process it and initiate the refund as per policy.' },
  { id: 'c3', category: 'cancellation', question: 'What happens if BOB Talkies cancels my booking?', answer: 'In the rare case we need to cancel, you\'ll receive a 100% refund immediately plus priority rebooking assistance.' },
  // Theatre
  { id: 'th1', category: 'theatre', question: 'How many people can each theatre accommodate?', answer: 'The Delight: 2–4 guests, Heavens: 4–10 guests, Filmdom: 6–13 guests, The Cosmos: 8–20 guests, The Vibe Hall: 20–40 guests.' },
  { id: 'th2', category: 'theatre', question: 'What is the screen and sound quality?', answer: 'All our theatres feature 4K projection and Dolby Atmos surround sound ranging from 5.1 to 11.1 channels, depending on the theatre.' },
  { id: 'th3', category: 'theatre', question: 'Is the booking truly private?', answer: 'Yes, 100%! You get the entire theatre exclusively. No other groups, no strangers — just you and your guests.' },
  { id: 'th4', category: 'theatre', question: 'What OTT platforms can I stream?', answer: 'You can connect your personal accounts of Netflix, Amazon Prime, Hotstar, Zee5, YouTube or any streaming service via HDMI.' },
  // Food
  { id: 'f1', category: 'food', question: 'Can I bring outside food?', answer: 'Yes, you are welcome to bring outside food and beverages. We also offer in-house food platters and beverages as add-ons if you prefer.' },
  { id: 'f2', category: 'food', question: 'Do you offer food delivery inside the theatre?', answer: 'Yes, we offer a range of snack platters, combo meals and beverages that can be ordered as add-ons during booking or at the venue.' },
  { id: 'f3', category: 'food', question: 'Are there vegetarian food options?', answer: 'Yes, we offer both vegetarian and non-vegetarian options. Please mention your preference in the special instructions during booking.' },
  // Decorations
  { id: 'd1', category: 'decorations', question: 'What decorations are included in the packages?', answer: 'Basic decorations (balloon + ribbon setup) are included in Silver and above. Premium floral and balloon setups are available as add-ons or in higher-tier packages.' },
  { id: 'd2', category: 'decorations', question: 'Can I request a custom decoration theme?', answer: 'Yes! You can specify your decoration preferences in the special instructions. Our team will do their best to accommodate your theme.' },
  { id: 'd3', category: 'decorations', question: 'How much time before my slot do you set up decorations?', answer: 'Our team sets up decorations 30–45 minutes before your slot. For grand setups, we may need 60–90 minutes\' notice.' },
  // Cakes
  { id: 'ca1', category: 'cakes', question: 'Can I bring my own cake?', answer: 'Yes! You can bring an external cake. We provide a cake counter and cutting service. We also offer customised designer cakes as add-ons.' },
  { id: 'ca2', category: 'cakes', question: 'What cake sizes are available?', answer: 'We offer 0.5 kg, 1 kg and 2 kg designer cakes as add-ons. Custom sizes may be available on request with 48 hours\' notice.' },
  { id: 'ca3', category: 'cakes', question: 'Can the cake be customised with a photo or message?', answer: 'Yes! When ordering a cake as an add-on, specify your customisation in the special instructions field.' },
  // OTT
  { id: 'o1', category: 'ott', question: 'Which streaming services can I use?', answer: 'You can use Netflix, Amazon Prime, Hotstar, Zee5, YouTube or any streaming service on your device connected via HDMI.' },
  { id: 'o2', category: 'ott', question: 'Is there Wi-Fi available?', answer: 'Yes, high-speed Wi-Fi is available in all our theatres for seamless streaming.' },
  // Guests
  { id: 'g1', category: 'guests', question: 'What if I bring more guests than booked?', answer: 'Extra guests are charged per person based on the theatre\'s extra-guest rate. Please inform us in advance so we can ensure seating is comfortable.' },
  // Parking
  { id: 'pk1', category: 'parking', question: 'Is parking available at the venue?', answer: 'Yes, free parking is available at our Kukatpally location. Street parking is also available nearby.' },
  // Timings
  { id: 't1', category: 'timings', question: 'What are your operating hours?', answer: 'We operate from 10:00 AM to 1:30 AM (next day), seven days a week, including public holidays.' },
  { id: 't2', category: 'timings', question: 'How long is each session?', answer: 'Standard sessions are 2–2.5 hours. Premium and Platinum packages offer 3–3.5 hour sessions. Additional time can be booked if the slot is available.' },
  // Rescheduling
  { id: 'r1', category: 'rescheduling', question: 'Can I reschedule my booking?', answer: 'Yes, you can request a reschedule up to 24 hours before your booking time, subject to availability. Submit a reschedule request from the My Booking page or contact us on WhatsApp.' },
  { id: 'r2', category: 'rescheduling', question: 'Is there a fee for rescheduling?', answer: 'No fee for the first reschedule. Subsequent reschedules are subject to a nominal service charge.' },
]

export const FAQ_CATEGORIES: Record<FaqCategory, string> = {
  booking: 'Booking',
  payment: 'Payment',
  cancellation: 'Cancellation & Refund',
  theatre: 'Theatre & Experience',
  food: 'Food & Beverages',
  decorations: 'Decorations',
  cakes: 'Cakes',
  ott: 'OTT / Streaming',
  guests: 'Guests',
  parking: 'Parking',
  timings: 'Timings',
  rescheduling: 'Rescheduling',
}
