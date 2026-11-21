import { Hammer } from 'lucide-react'
import { PageHeader } from '@/admin/components/layout/PageHeader'
import { Card, EmptyState } from '@/admin/components/ui'
import type { NavItem } from '@/admin/components/layout/nav'

/** Stands in for a module that is not built yet; replaced module by module. */
export default function PlaceholderPage({ item }: { item: NavItem }) {
  return (
    <>
      <PageHeader title={item.label} description={item.description} />
      <Card>
        <EmptyState
          icon={<Hammer className="h-5 w-5" />}
          title={`${item.label} is coming next`}
          description="This screen is being built. The backend for it is ready."
          className="py-20"
        />
      </Card>
    </>
  )
}
