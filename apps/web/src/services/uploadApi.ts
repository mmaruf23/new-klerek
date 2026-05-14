import type { ApiResponse, Summary } from '@packages/contract';

const API_URL = import.meta.env.VITE_API_URL ?? '';

export async function uploadFile(file: File): Promise<Summary> {
  let res: Response;
  try {
    const form = new FormData();
    form.append('file', file);
    res = await fetch(`${API_URL}/`, {
      method: 'POST',
      body: form,
      credentials: 'include',
    });
  } catch {
    throw new Error('Tidak dapat terhubung ke server.');
  }
  const json: ApiResponse<Summary> = await res.json();
  if (!json.success || !json.data)
    throw new Error(json.message ?? 'Gagal memproses file.');
  return json.data;
}
