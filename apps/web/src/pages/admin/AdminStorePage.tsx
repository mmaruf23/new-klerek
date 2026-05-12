/* eslint-disable react-refresh/only-export-components */
import {
  useLoaderData,
  useNavigate,
  useNavigation,
  useSearchParams,
  redirect,
  type LoaderFunctionArgs,
} from 'react-router-dom';
import type { ApiResponse } from '@packages/contract';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, Store, ChevronLeft, ChevronRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL ?? '';
const LIMIT = 20;
const ADMIN_TOKEN_KEY = 'klerek_admin_token';

interface StoreItem {
  id: string;
  name: string;
  branchId: string | null;
  createdAt: string;
}

interface StoreListData {
  data: StoreItem[];
  total: number;
  limit: number;
  offset: number;
  hasNext: boolean;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(
    new Date(iso),
  );
}

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<StoreListData> {
  const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
  if (!token) throw redirect('/admin/login');

  const url = new URL(request.url);
  const offset = Number(url.searchParams.get('offset') ?? '0');

  const res = await fetch(`${API_URL}/store?limit=${LIMIT}&offset=${offset}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    throw redirect('/admin/login');
  }

  const json: ApiResponse<StoreListData> = await res.json();
  if (!json.success || !json.data)
    throw new Response(json.message ?? 'Gagal memuat data.', { status: 500 });

  return json.data;
}

export default function AdminStorePage() {
  const stores = useLoaderData() as StoreListData;
  const navigate = useNavigate();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();

  const offset = Number(searchParams.get('offset') ?? '0');
  const loading = navigation.state === 'loading';
  const currentPage = Math.floor(offset / LIMIT) + 1;
  const totalPages = Math.ceil(stores.total / LIMIT);

  const handlePrev = () => navigate(`?offset=${Math.max(0, offset - LIMIT)}`);
  const handleNext = () => navigate(`?offset=${offset + LIMIT}`);

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-lg font-semibold text-foreground">
              Daftar Toko
            </h1>
            <Badge variant="secondary" className="text-xs">
              {stores.total} toko
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1.5" />
            Keluar
          </Button>
        </div>

        <Card>
          {loading ? (
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Memuat...
            </CardContent>
          ) : stores.data.length === 0 ? (
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Belum ada toko terdaftar.
            </CardContent>
          ) : (
            <>
              <CardHeader className="pb-0">
                <div className="grid grid-cols-[1fr_2fr_1fr_1fr] gap-4 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <span>ID</span>
                  <span>Nama Toko</span>
                  <span>Cabang</span>
                  <span>Terdaftar</span>
                </div>
              </CardHeader>
              <CardContent className="pt-2 pb-0">
                <div className="divide-y divide-border">
                  {stores.data.map((store) => (
                    <div
                      key={store.id}
                      className="grid grid-cols-[1fr_2fr_1fr_1fr] gap-4 px-2 py-3 items-center"
                    >
                      <span className="text-sm font-mono font-medium text-foreground">
                        {store.id}
                      </span>
                      <span className="text-sm text-foreground truncate">
                        {store.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {store.branchId ?? '—'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(store.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>

              {stores.total > LIMIT && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    Halaman {currentPage} dari {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrev}
                      disabled={offset === 0 || loading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNext}
                      disabled={!stores.hasNext || loading}
                    >
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
  );
}
