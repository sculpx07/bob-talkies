import { useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ExternalLink, MoreHorizontal, Power, Trash2 } from 'lucide-react'
import { PageHeader } from '@/admin/components/layout/PageHeader'
import {
  Badge, Button, Card, ConfirmDialog, ErrorState, IconButton, LoadingBlock, Menu, Tabs, useToast, type MenuItem,
} from '@/admin/components/ui'
import { useAuth } from '@/admin/auth/AuthProvider'
import { ROLES } from '@/admin/types/auth'
import { useDisclosure } from '@/admin/hooks/useDisclosure'
import { errorMessage } from '@/admin/lib/api/errors'
import { formatDateTime } from '@/admin/lib/utils/date'
import { formatPaise } from '@/admin/lib/utils/money'
import { useDeleteTheatre, useSetTheatreActive, useTheatre, useUpdateTheatre } from '../api'
import { TheatreForm } from '../components/TheatreForm'
import { TheatreImages } from '../components/TheatreImages'
import { formToTheatreInput, theatreToForm } from '../schema'

const who = (ref: unknown) => (ref && typeof ref === 'object' && 'name' in ref ? String(ref.name) : 'system')

export default function TheatreEditPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { hasRole } = useAuth()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? 'details'

  const query = useTheatre(id)
  const update = useUpdateTheatre(id)
  const setActive = useSetTheatreActive()
  const remove = useDeleteTheatre()
  const confirmDelete = useDisclosure()

  const theatre = query.data
  const formDefaults = useMemo(() => (theatre ? theatreToForm(theatre) : null), [theatre])

  if (query.isLoading) return <LoadingBlock />
  if (query.error || !theatre || !formDefaults) {
    return <ErrorState error={query.error} retry={() => query.refetch()} title="Could not load this theatre" />
  }

  const toggleActive = () =>
    setActive.mutate(
      { id, isActive: !theatre.isActive },
      {
        onSuccess: (t) => toast.success(`${t.name} is now ${t.isActive ? 'active' : 'inactive'}`),
        onError: (err) => toast.error('Could not change status', errorMessage(err)),
      },
    )

  const doDelete = () =>
    remove.mutate(id, {
      onSuccess: () => {
        toast.success(`${theatre.name} deleted`)
        navigate('/theatres', { replace: true })
      },
      onError: (err) => {
        confirmDelete.close()
        toast.error('Could not delete', errorMessage(err))
      },
    })

  const menuItems: MenuItem[] = [
    { label: theatre.isActive ? 'Deactivate' : 'Activate', icon: <Power />, onSelect: toggleActive },
    ...(hasRole(ROLES.SUPER_ADMIN) ? [{ label: 'Delete theatre', icon: <Trash2 />, danger: true, onSelect: confirmDelete.open }] : []),
  ]

  return (
    <>
      <PageHeader
        title={theatre.name}
        back={{ to: '/theatres', label: 'Theatres' }}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={theatre.isActive ? 'success' : 'neutral'} dot>{theatre.isActive ? 'Active' : 'Inactive'}</Badge>
            <span>From {formatPaise(theatre.startingPricePaise)}</span>
            <span className="text-slate-300">·</span>
            <span>Updated {formatDateTime(theatre.updatedAt)} by {who(theatre.updatedBy)}</span>
          </span>
        }
        actions={
          <>
            <a href={`/theatres/${theatre.slug}`} target="_blank" rel="noreferrer">
              <Button variant="secondary" rightIcon={<ExternalLink className="h-4 w-4" />}>View on website</Button>
            </a>
            <Menu trigger={<IconButton label="More actions" variant="secondary"><MoreHorizontal className="h-4 w-4" /></IconButton>} items={menuItems} />
          </>
        }
      />

      <Tabs
        value={tab}
        onValueChange={(value) => setParams(value === 'details' ? {} : { tab: value }, { replace: true })}
        items={[
          {
            value: 'details',
            label: 'Details',
            content: (
              <TheatreForm
                defaultValues={formDefaults}
                submitLabel="Save changes"
                onSubmit={async (values) => {
                  await update.mutateAsync(formToTheatreInput(values))
                  toast.success('Changes saved')
                }}
              />
            ),
          },
          { value: 'photos', label: 'Photos', count: theatre.images.length, content: <TheatreImages theatre={theatre} /> },
        ]}
      />

      {!hasRole(ROLES.SUPER_ADMIN) && (
        <Card className="mt-6 px-5 py-4 text-sm text-slate-500">Only a super admin can delete a theatre. You can deactivate it instead.</Card>
      )}

      <ConfirmDialog
        open={confirmDelete.isOpen}
        onOpenChange={confirmDelete.setOpen}
        title={`Delete ${theatre.name}?`}
        description="It disappears from the admin panel and the website. Past bookings keep their details. Theatres with upcoming bookings cannot be deleted."
        confirmLabel="Delete theatre"
        tone="danger"
        loading={remove.isPending}
        onConfirm={doDelete}
      />
    </>
  )
}
