import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

/*
 * Temporary stand-ins for backend endpoints that are not built yet. Each area's
 * handlers are deleted as it is connected to the real backend; requests without
 * a handler go to the backend. Remove this folder (and VITE_USE_MOCKS) once empty.
 */
export const worker = setupWorker(...handlers)
