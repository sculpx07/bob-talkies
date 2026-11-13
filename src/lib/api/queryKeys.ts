export const theatreKeys = {
  all: ['theatres'] as const,
  list: () => [...theatreKeys.all, 'list'] as const,
  detail: (slug: string) => [...theatreKeys.all, 'detail', slug] as const,
}

export const packageKeys = {
  all: ['packages'] as const,
  list: (theatreId?: string) => [...packageKeys.all, 'list', theatreId] as const,
}

export const addonKeys = {
  all: ['addons'] as const,
  list: (theatreId?: string) => [...addonKeys.all, 'list', theatreId] as const,
}

export const availabilityKeys = {
  all: ['availability'] as const,
  slots: (theatreId: string, date: string) =>
    [...availabilityKeys.all, 'slots', theatreId, date] as const,
  calendar: (theatreId: string, month: string) =>
    [...availabilityKeys.all, 'calendar', theatreId, month] as const,
}

export const bookingKeys = {
  all: ['bookings'] as const,
  detail: (id: string) => [...bookingKeys.all, 'detail', id] as const,
  my: (page?: number) => [...bookingKeys.all, 'my', page] as const,
}

export const offerKeys = {
  all: ['offers'] as const,
  list: () => [...offerKeys.all, 'list'] as const,
}

export const reviewKeys = {
  all: ['reviews'] as const,
  list: (page?: number) => [...reviewKeys.all, 'list', page] as const,
}
