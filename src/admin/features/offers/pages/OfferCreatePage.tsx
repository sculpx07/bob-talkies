import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/admin/components/layout/PageHeader'
import { useToast } from '@/admin/components/ui'
import { useCreateOffer } from '../api'
import { OfferForm } from '../components/OfferForm'
import { emptyOfferForm, formToOfferInput } from '../schema'

export default function OfferCreatePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const create = useCreateOffer()
  const defaults = useMemo(() => emptyOfferForm(), [])

  return (
    <>
      <PageHeader title="Add offer" description="An image can be added once it is saved." back={{ to: '/offers', label: 'Offers' }} />
      <OfferForm
        defaultValues={defaults}
        submitLabel="Create offer"
        onCancel={() => navigate('/offers')}
        onSubmit={async (values) => {
          const offer = await create.mutateAsync(formToOfferInput(values))
          toast.success(`${offer.code} created`)
          navigate(`/offers/${offer.id}`, { replace: true })
        }}
      />
    </>
  )
}
