import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/admin/components/layout/PageHeader'
import { Tabs } from '@/admin/components/ui'
import { useAddonCategories } from '../api'
import { AddonsTable } from '../components/AddonsTable'
import { CategoriesTab } from '../components/CategoriesTab'

export default function AddonsPage() {
  const [params, setParams] = useSearchParams()
  const categories = useAddonCategories()
  const tab = params.get('tab') ?? 'addons'

  return (
    <>
      <PageHeader title="Add-ons & cakes" description="Extras customers add to a booking: cakes and their sizes, effects, decor, flowers, gifts, photography." />
      <Tabs
        value={tab}
        onValueChange={(value) => setParams(value === 'addons' ? {} : { tab: value }, { replace: true })}
        items={[
          { value: 'addons', label: 'Add-ons', content: <AddonsTable /> },
          { value: 'categories', label: 'Categories', count: categories.data?.length, content: <CategoriesTab /> },
        ]}
      />
    </>
  )
}
