import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Topnav } from '../../shared/components/topnav/topnav';
import { Footer } from '../../shared/components/footer/footer';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'cnh-public-layout',
  imports: [RouterOutlet, Topnav, Footer],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.scss',
})
export class PublicLayout {
  authService = inject(AuthService);
}
