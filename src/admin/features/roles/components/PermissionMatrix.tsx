import { Lock } from 'lucide-react'
import { Badge, Card } from '@/admin/components/ui'
import { cn } from '@/admin/lib/utils/cn'
import type { Permission } from '@/admin/types/permissions'
import type { PermissionGroup } from '../types'
import { toggleGroup, togglePermission } from '../utils'

/**
 * Permissions of a role, one card per module. `canGrant` greys out permissions the
 * signed-in person does not have themselves (the backend refuses to hand those out).
 */
export function PermissionMatrix({ groups, value, onChange, readOnly, canGrant, invalid }: {
  groups: PermissionGroup[]
  value: Permission[]
  onChange: (next: Permission[]) => void
  readOnly?: boolean
  canGrant: (key: Permission) => boolean
  invalid?: boolean
}) {
  const has = (key: Permission) => value.includes(key)

  return (
    <div className={cn('grid gap-3 lg:grid-cols-2', invalid && 'rounded-xl ring-2 ring-red-300 ring-offset-4')}>
      {groups.map((group) => {
        const on = group.permissions.filter((p) => has(p.key)).length
        const all = on === group.permissions.length
        const grantable = group.permissions.some((p) => canGrant(p.key))
        const groupId = `perm-group-${group.key}`
        return (
          <Card key={group.key} className="p-4" role="group" aria-labelledby={groupId}>
            <div className="flex items-center justify-between gap-2">
              <h3 id={groupId} className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                {group.label}
                {on > 0 && <Badge tone={all ? 'success' : 'brand'}>{all ? 'All' : `${on} of ${group.permissions.length}`}</Badge>}
              </h3>
              {!readOnly && (
                <label className={cn('flex items-center gap-1.5 text-xs font-medium text-slate-600', grantable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50')}>
                  <input
                    type="checkbox"
                    className="focus-ring h-4 w-4 rounded border-slate-300 accent-violet-600"
                    checked={all}
                    ref={(el) => { if (el) el.indeterminate = on > 0 && !all }}
                    disabled={!grantable}
                    onChange={(e) => onChange(toggleGroup(value, group, e.target.checked, canGrant))}
                    aria-label={`All ${group.label} permissions`}
                  />
                  All
                </label>
              )}
            </div>
            <ul className="mt-3 space-y-2">
              {group.permissions.map((p) => {
                const locked = !readOnly && !canGrant(p.key) && !has(p.key)
                return (
                  <li key={p.key}>
                    <label className={cn('flex items-start gap-2.5 text-sm', readOnly || locked ? 'cursor-default' : 'cursor-pointer')} title={locked ? 'You do not have this permission, so you cannot give it' : undefined}>
                      <input
                        type="checkbox"
                        className="focus-ring mt-0.5 h-4 w-4 rounded border-slate-300 accent-violet-600"
                        checked={has(p.key)}
                        disabled={readOnly || locked}
                        onChange={(e) => onChange(togglePermission(value, group, p.key, e.target.checked))}
                        aria-label={`${group.label}: ${p.label}`}
                      />
                      <span className="min-w-0">
                        <span className={cn('flex items-center gap-1 font-medium', has(p.key) ? 'text-slate-900' : 'text-slate-600')}>
                          {p.label}
                          {locked && <Lock className="h-3 w-3 text-slate-400" aria-hidden="true" />}
                        </span>
                        {p.description && <span className="block text-xs text-slate-500">{p.description}</span>}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </Card>
        )
      })}
    </div>
  )
}
