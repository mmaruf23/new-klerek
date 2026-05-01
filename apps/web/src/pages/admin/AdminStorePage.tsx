import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ApiResponse } from '@packages/contract'
import { useAdmin } from '@/context/AdminContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LogOut, Store, ChevronLeft, ChevronRight } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL ?? ''
const LIMIT = 20

interface StoreItem {
  id: string
  name: string
  branchId: string | null
  createdAt: string
}

interface StoreListData {
  data: StoreItem[]
  total: number
  limit: number
  offset: number
  hasNext: boolean
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(iso))
}

export default function AdminStorePage() {
  const navigate = useNavigate()
  const { token, logout } = useAdmin()
  const [stores, setStores] = useState<StoreListData | null>(null)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStores = useCallback(async (currentOffset: number) => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/store?limit=${LIMIT}&offset=${currentOffset}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401) {
        logout()
        navigate('/admin/login')
        return
      }
      const json: ApiResponse<StoreListData> = await res.json()
      if (!json.success || !json.data) {
        setError(json.message ?? 'Gagal memuat data.')
        return
      }
      setStores(json.data)
    } catch {
      setError('Tidak dapat terhubung ke server.')
    } finally {
      setLoading(false)
    }
  }, [token, logout, navigate])

  useEffect(() => {
    if (!token) {
      navigate('/admin/login', { replace: true })
      return
    }
    void fetchStores(offset)
  }, [token, offset, fetchStores, navigate])

  const handlePrev = () => setOffset((o) => Math.max(0, o - LIMIT))
  const handleNext = () => setOffset((o) => o + LIMIT)

  const currentPage = Math.floor(offset / LIMIT) + 1
  const totalPages = stores ? Math.ceil(stores.total / LIMIT) : 1

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4">
      <div className="max-w-3xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-[var(--color-muted-foreground)]" />
            <h1 className="text-lg font-semibold text-[var(--color-foreground)]">
              Daftar Toko
            </h1>
            {stores && (
              <Badge variant="secondary" className="text-xs">
                {stores.total} toko
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => { logout(); navigate('/admin/login') }}>
            <LogOut className="h-4 w-4 mr-1.5" />
            Keluar
          </Button>
        </div>

        {/* Content */}
        {error && (
          <p className="text-sm text-[var(--color-destructive)]">{error}</p>
        )}

        <Card>
          {loading ? (
            <CardContent className="py-12 text-center text-sm text-[var(--color-muted-foreground)]">
              Memuat...
            </CardContent>
          ) : stores && stores.data.length === 0 ? (
            <CardContent className="py-12 text-center text-sm text-[var(--color-muted-foreground)]">
              Belum ada toko terdaftar.
            </CardContent>
          ) : (
            <>
              <CardHeader className="pb-0">
                <div className="grid grid-cols-[1fr_2fr_1fr_1fr] gap-4 px-2 text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide">
                  <span>ID</span>
                  <span>Nama Toko</span>
                  <span>Cabang</span>
                  <span>Terdaftar</span>
                </div>
              </CardHeader>
              <CardContent className="pt-2 pb-0">
                <div className="divide-y divide-[var(--color-border)]">
                  {stores?.data.map((store) => (
                    <div
                      key={store.id}
                      className="grid grid-cols-[1fr_2fr_1fr_1fr] gap-4 px-2 py-3 items-center"
                    >
                      <span className="text-sm font-mono font-medium text-[var(--color-foreground)]">
                        {store.id}
                      </span>
                      <span className="text-sm text-[var(--color-foreground)] truncate">
                        {store.name}
                      </span>
                      <span className="text-sm text-[var(--color-muted-foreground)]">
                        {store.branchId ?? '—'}
                      </span>
                      <span className="text-sm text-[var(--color-muted-foreground)]">
                        {formatDate(store.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>

              {/* Pagination */}
              {stores && stores.total > LIMIT && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--color-border)]">
                  <span className="text-xs text-[var(--color-muted-foreground)]">
                    Halaman {currentPage} dari {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handlePrev} disabled={offset === 0}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleNext} disabled={!stores.hasNext}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

      </div>
    </div>
  )
}
