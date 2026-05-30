import { useCallback, useEffect, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useEcho } from '@/hooks/use-echo'

type LogEntry = {
  channel: string
  event: string
  data: string
  timestamp: number
  id: number
}

const logId = 0

export function ReverbMonitor() {
  const { isConnected, subscribe, unsubscribe, getEvents, clearEvents, version } = useEcho()
  const [channelInput, setChannelInput] = useState('dashboard-monitor')
  const [subscribedChannels, setSubscribedChannels] = useState<string[]>([])
  const [log, setLog] = useState<LogEntry[]>([])
  const [autoScroll, setAutoScroll] = useState(true)
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const events = getEvents()
    const currentIds = new Set(log.map((e) => e.id))
    const newEntries: LogEntry[] = []

    for (const e of events) {
      const id = e.timestamp

      if (!currentIds.has(id)) {
        newEntries.push({
          channel: e.channel,
          event: e.event,
          data: JSON.stringify(e.data, null, 2),
          timestamp: e.timestamp,
          id,
        })
        currentIds.add(id)
      }
    }

    if (newEntries.length > 0) {
      setLog((prev) => [...prev, ...newEntries].slice(-200))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version])

  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [log, autoScroll])

  const handleSubscribe = useCallback(() => {
    const ch = channelInput.trim()

    if (!ch || subscribedChannels.includes(ch)) {
return
}

    subscribe(ch)
    setSubscribedChannels((prev) => [...prev, ch])
  }, [channelInput, subscribedChannels, subscribe])

  const handleUnsubscribe = useCallback(
    (ch: string) => {
      unsubscribe(ch)
      setSubscribedChannels((prev) => prev.filter((c) => c !== ch))
    },
    [unsubscribe],
  )

  const handleClear = useCallback(() => {
    clearEvents()
    setLog([])
  }, [clearEvents])

  return (
    <div className="flex h-full flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Reverb Monitor</CardTitle>
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Channel name (e.g. dashboard-monitor)"
              value={channelInput}
              onChange={(e) => setChannelInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
            />
            <Button onClick={handleSubscribe} variant="default">
              Subscribe
            </Button>
          </div>

          {subscribedChannels.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {subscribedChannels.map((ch) => (
                <Badge
                  key={ch}
                  variant="secondary"
                  className="cursor-pointer gap-1 pr-1"
                  onClick={() => handleUnsubscribe(ch)}
                >
                  {ch}
                  <span className="ml-1 text-muted-foreground">×</span>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base">
            Event Log
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {log.length} events
            </span>
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setAutoScroll(!autoScroll)}>
              {autoScroll ? 'Auto-scroll ON' : 'Auto-scroll OFF'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[500px] overflow-y-auto font-mono text-xs">
            {log.length === 0 && (
              <p className="py-8 text-center text-muted-foreground">
                Subscribe to a channel to start monitoring events
              </p>
            )}
            {log.map((entry) => (
              <div key={entry.id} className="border-b border-border/50 py-2 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {entry.channel}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {entry.event}
                  </Badge>
                </div>
                <details className="mt-1">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    Payload
                  </summary>
                  <pre className="mt-1 whitespace-pre-wrap rounded bg-muted p-2 text-xs">
                    {entry.data}
                  </pre>
                </details>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
