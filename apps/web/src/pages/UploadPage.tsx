import { useRef, useState, type DragEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import type { ApiResponse, Summary } from '@packages/contract'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { UploadCloud } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL ?? ''

export default function UploadPage() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const hasPrevSummary = !!sessionStorage.getItem('klerek_summary')

  const handleFile = (f: File) => {
    setError(null)
    setFile(f)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`${API_URL}/`, {
        method: 'POST',
        body: form,
        credentials: 'include',
      })
      const json: ApiResponse<Summary> = await res.json()
      if (!json.success || !json.data) {
        setError(json.message ?? 'Gagal memproses file.')
        return
      }
      sessionStorage.setItem('klerek_summary', JSON.stringify(json.data))
      navigate('/summary')
    } catch {
      setError('Tidak dapat terhubung ke server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-background)]">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
            Klerek
          </h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Upload file rekap harian dari POS
          </p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div
              onClick={() => inputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              className={`
                flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-10 cursor-pointer transition-colors
                ${dragging ? 'border-[var(--color-primary)] bg-[var(--color-accent)]' : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'}
              `}
            >
              <UploadCloud className="h-8 w-8 text-[var(--color-muted-foreground)]" />
              {file ? (
                <p className="text-sm font-medium text-[var(--color-foreground)]">{file.name}</p>
              ) : (
                <p className="text-sm text-[var(--color-muted-foreground)] text-center">
                  Drag & drop file <span className="font-medium">.zip</span> di sini,
                  <br />atau klik untuk memilih
                </p>
              )}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept=".zip"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />

            {error && (
              <p className="text-sm text-[var(--color-destructive)]">{error}</p>
            )}

            <Button
              className="w-full"
              onClick={handleUpload}
              disabled={!file || loading}
            >
              {loading ? 'Memproses...' : 'Upload & Proses'}
            </Button>
          </CardContent>
        </Card>

        {hasPrevSummary && (
          <p className="text-center text-sm text-[var(--color-muted-foreground)]">
            <Link to="/summary" className="underline underline-offset-4 hover:text-[var(--color-foreground)]">
              Lihat rekap terakhir →
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
