import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/admin/components/layout/PageHeader'
import { useToast } from '@/admin/components/ui'
import { useCreateAddon } from '../api'
import { AddonForm } from '../components/AddonForm'
import { emptyAddonForm, formToAddonInput } from '../schema'

export default function AddonCreatePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [params] = useSearchParams()
  const create = useCreateAddon()
  // coming from a filtered list (?category=...) pre-selects that category
  const defaults = useMemo(() => emptyAddonForm(params.get('category') ?? ''), [params])

  return (
    <>
      <PageHeader title="Add add-on" description="A photo can be added once it is saved." back={{ to: '/addons', label: 'Add-ons & cakes' }} />
      <AddonForm
        defaultValues={defaults}
        submitLabel="Create add-on"
        onCancel={() => navigate('/addons')}
        onSubmit={async (values) => {
          const addon = await create.mutateAsync(formToAddonInput(values))
          toast.success(`${addon.name} created`, 'Now add a photo.')
          navigate(`/addons/${addon.id}`, { replace: true })
        }}
      />
    </>
  )
}
