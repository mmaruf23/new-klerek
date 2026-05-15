import { redirect, type MiddlewareFunction } from 'react-router-dom';
import { ADMIN_TOKEN_KEY } from '@/services/adminApi';

export const requireAdminMiddleware: MiddlewareFunction = async (_, next) => {
  if (!sessionStorage.getItem(ADMIN_TOKEN_KEY))
    return redirect('/admin/login');
  return next();
};

export const redirectIfAdminMiddleware: MiddlewareFunction = async (_, next) => {
  if (sessionStorage.getItem(ADMIN_TOKEN_KEY))
    return redirect('/admin/stores');
  return next();
};
