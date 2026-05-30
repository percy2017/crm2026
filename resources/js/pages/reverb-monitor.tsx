import { Head } from '@inertiajs/react'
import { ReverbMonitor } from '@/components/reverb-monitor'

export default function ReverbMonitorPage() {
  return (
    <>
      <Head title="Reverb Monitor" />
      <ReverbMonitor />
    </>
  )
}

ReverbMonitorPage.layout = {
  breadcrumbs: [
    {
      title: 'Reverb Monitor',
      href: '/reverb-monitor',
    },
  ],
}
