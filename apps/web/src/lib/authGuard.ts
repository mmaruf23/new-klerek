import { redirect } from 'react-router-dom';
import { ADMIN_TOKEN_KEY } from '@/services/adminApi';

export function requireAdmin() {
  if (!sessionStorage.getItem(ADMIN_TOKEN_KEY))
    throw redirect('/admin/login');
}

export function redirectIfAdmin() {
  if (sessionStorage.getItem(ADMIN_TOKEN_KEY))
    throw redirect('/admin/stores');
}
