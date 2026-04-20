import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';
import { USER_ROLES } from './core/models/auth.model';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },

  {
    path: '',
    loadComponent: () =>
      import('./layouts/public-layout/public-layout').then(m => m.PublicLayout),
    children: [
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./pages/public/login/login').then(m => m.Login)
      },
      {
        path: 'registrieren',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./pages/public/register/register').then(m => m.Register)
      },
      {
        path: 'passwort-vergessen',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./pages/public/forgot-password/forgot-password').then(m => m.ForgotPassword)
      },
      {
        path: 'passwort-vergeben',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./pages/public/set-password/set-password').then(m => m.SetPassword)
      },
      {
        path: 'kontakt',
        loadComponent: () =>
          import('./pages/public/contact/contact').then(m => m.Contact)
      },
      {
        path: 'impressum',
        loadComponent: () =>
          import('./pages/public/imprint/imprint').then(m => m.Imprint)
      },
      // {
      //   path: 'datenschutz',
      //   loadComponent: () =>
      //     import('./pages/public/privacy/privacy').then(m => m.Privacy)
      // }
    ]
  },

  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/secure-layout/secure-layout').then(m => m.SecureLayout),
    children: [
      {
        path: 'news',
        loadComponent: () =>
          import('./pages/secure/news/news').then(m => m.News)
      },
      {
        path: 'punktestand',
        canActivate: [roleGuard],
        data: {
          roles: [
            USER_ROLES.SYSADMIN,
            USER_ROLES.VIPP_ADMIN,
            USER_ROLES.CNH_ADMIN,
            USER_ROLES.CNH_SALES
          ]
        },
        loadComponent: () =>
          import('./pages/secure/score/score').then(m => m.Score)
      },
      {
        path: 'ranking',
        canActivate: [roleGuard],
        data: {
          roles: [
            USER_ROLES.SYSADMIN,
            USER_ROLES.VIPP_ADMIN,
            USER_ROLES.CNH_ADMIN,
            USER_ROLES.CNH_MANAGEMENT
          ]
        },
        loadComponent: () =>
          import('./pages/secure/ranking/ranking').then(m => m.Ranking)
      },
      {
        path: 'regeln',
        loadComponent: () =>
          import('./pages/secure/rules/rules').then(m => m.Rules)
      },
      {
        path: 'reise',
        loadComponent: () =>
          import('./pages/secure/travel/travel').then(m => m.Travel)
      },
      {
        path: 'bonus',
        canActivate: [roleGuard],
        data: {
          roles: [
            USER_ROLES.SYSADMIN,
            USER_ROLES.VIPP_ADMIN,
            USER_ROLES.CNH_ADMIN,
            USER_ROLES.CNH_SALES
          ]
        },
        loadComponent: () =>
          import('./pages/secure/bonus/bonus').then(m => m.Bonus)
      },
      {
        path: 'profil',
        loadComponent: () =>
          import('./pages/secure/profile/profile').then(m => m.Profile)
      },
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: {
          roles: [
            USER_ROLES.SYSADMIN,
            USER_ROLES.VIPP_ADMIN,
            USER_ROLES.CNH_ADMIN
          ]
        },
        loadComponent: () =>
          import('./pages/secure/admin/admin').then(m => m.Admin)
      }
    ]
  },

  {
    path: '**',
    redirectTo: 'login'
  }
];