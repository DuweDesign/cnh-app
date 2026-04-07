import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Topnav } from '../../shared/components/topnav/topnav';
import { Footer } from '../../shared/components/footer/footer';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'cnh-secure-layout',
  imports: [RouterOutlet, Topnav, Footer],
  templateUrl: './secure-layout.html',
  styleUrl: './secure-layout.scss',
})
export class SecureLayout {
  authService = inject(AuthService)
}
