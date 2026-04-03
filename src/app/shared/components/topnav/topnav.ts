import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'cnh-topnav',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './topnav.html',
  styleUrl: './topnav.scss'
})
export class Topnav {
  @Input() isLoggedIn = false;
}