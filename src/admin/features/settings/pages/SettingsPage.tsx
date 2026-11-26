import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/admin/components/layout/PageHeader'
import { ErrorState, LoadingBlock, Tabs } from '@/admin/components/ui'
import { useAuth } from '@/admin/auth/AuthProvider'
import { PERMISSIONS } from '@/admin/types/permissions'
import { formatDateTime } from '@/admin/lib/utils/date'
import { useSettings } from '../api'
import { HistoryTab } from '../components/HistoryTab'
import { SettingsForm } from '../components/SettingsForm'
import { PaymentSettingsPanel } from '../payments/PaymentSettingsPanel'
import { CrmSettingsPanel } from '../crm/CrmSettingsPanel'

export default function SettingsPage() {
  const { can } = useAuth()
  const [params, setParams] = useSearchParams()
  const settings = useSettings()
  const tab = params.get('tab') ?? 'settings'

  const s = settings.data
  return (
    <>
      <PageHeader
        title="Settings"
        description={s ? `Last changed ${formatDateTime(s.updatedAt)}${s.updatedBy ? ` by ${s.updatedBy.name}` : ''}` : 'Pricing, booking rules and contact details.'}
      />
      {settings.isLoading ? (
        <LoadingBlock />
      ) : settings.error || !s ? (
        <ErrorState error={settings.error} retry={() => settings.refetch()} />
      ) : (
        <Tabs
          value={tab}
          onValueChange={(value) => setParams(value === 'settings' ? {} : { tab: value }, { replace: true })}
          items={[
            { value: 'settings', label: 'Settings', content: <SettingsForm settings={s} canEdit={can(PERMISSIONS.SETTINGS_EDIT)} /> },
            { value: 'payments', label: 'Payments', content: <PaymentSettingsPanel canEdit={can(PERMISSIONS.SETTINGS_PAYMENTS)} /> },
            // the CRM connection holds a secret, so it has its own permission
            ...(can(PERMISSIONS.SETTINGS_INTEGRATIONS) ? [{ value: 'crm', label: 'CRM', content: <CrmSettingsPanel canEdit /> }] : []),
            { value: 'history', label: 'Change history', content: <HistoryTab /> },
          ]}
        />
      )}
    </>
  )
}
