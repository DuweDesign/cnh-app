import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('cnh_token');

  // Kein Token → Request unverändert durchlassen
  if (!token) {
    return next(req);
  }

  // Request klonen und Header setzen
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);
};