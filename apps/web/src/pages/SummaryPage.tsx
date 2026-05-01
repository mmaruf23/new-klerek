import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useSummary } from '@/context/SummaryContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Store, CalendarDays, Receipt } from 'lucide-react'

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

export default function SummaryPage() {
  const navigate = useNavigate()
  const { summary } = useSummary()

  useEffect(() => {
    if (!summary) navigate('/', { replace: true })
  }, [summary, navigate])

  if (!summary) return null

  const totalNominal = summary.data.reduce((acc, d) => acc + d.cash, 0)

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4">
      <div className="max-w-lg mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center gap-3 py-2">
          <Link to="/" className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold text-[var(--color-foreground)]">Rekap Harian</h1>
        </div>

        {/* Store info */}
        <Card>
          <CardContent className="pt-5 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Store className="h-4 w-4 text-[var(--color-muted-foreground)]" />
              <span className="font-medium text-[var(--color-foreground)]">{summary.store_name}</span>
              <span className="text-[var(--color-muted-foreground)]">·</span>
              <span className="text-[var(--color-muted-foreground)]">{summary.branch_id}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
              <CalendarDays className="h-4 w-4" />
              <span>{summary.date_tx}</span>
            </div>
          </CardContent>
        </Card>

        {/* Totals */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs text-[var(--color-muted-foreground)] font-normal">Total Faktur</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-semibold text-[var(--color-foreground)]">{summary.total_faktur}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs text-[var(--color-muted-foreground)] font-normal">Total Nominal</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-lg font-semibold text-[var(--color-foreground)] leading-tight">{formatRupiah(totalNominal)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction list */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Daftar Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="divide-y divide-[var(--color-border)]">
              {summary.data.map((tx) => (
                <div key={tx.faktur.bill_no} className="flex items-center justify-between px-6 py-3">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-[var(--color-foreground)]">
                      #{tx.faktur.bill_no}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant={tx.member ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                        {tx.member ? 'Member' : 'Non-member'}
                      </Badge>
                      <span className="text-xs text-[var(--color-muted-foreground)]">
                        {tx.items.length} item · {tx.time_tx}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-[var(--color-foreground)]">
                    {formatRupiah(tx.cash)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
