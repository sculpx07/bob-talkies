/** Module-level store for personalised media files the customer uploads during booking.
 *  File objects can't be serialised into the booking reducer / localStorage, so we keep them here.
 *  The store is read by BookSuccessPage immediately after confirmation, then cleared.
 */
let _files: File[] = []

export const mediaStore = {
  set(files: File[]) { _files = [...files] },
  get(): File[] { return _files },
  clear() { _files = [] },
}
