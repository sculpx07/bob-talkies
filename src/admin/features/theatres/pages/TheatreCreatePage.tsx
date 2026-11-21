import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/admin/components/layout/PageHeader'
import { useToast } from '@/admin/components/ui'
import { useCreateTheatre } from '../api'
import { TheatreForm } from '../components/TheatreForm'
import { emptyTheatreForm, formToTheatreInput } from '../schema'

export default function TheatreCreatePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const create = useCreateTheatre()

  return (
    <>
      <PageHeader
        title="Add theatre"
        description="Photos can be added once the theatre is saved."
        back={{ to: '/theatres', label: 'Theatres' }}
      />
      <TheatreForm
        defaultValues={emptyTheatreForm}
        submitLabel="Create theatre"
        onCancel={() => navigate('/theatres')}
        onSubmit={async (values) => {
          const theatre = await create.mutateAsync(formToTheatreInput(values))
          toast.success(`${theatre.name} created`, 'Now add some photos.')
          navigate(`/theatres/${theatre.id}?tab=photos`, { replace: true })
        }}
      />
    </>
  )
}
