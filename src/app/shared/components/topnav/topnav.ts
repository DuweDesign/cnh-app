import { CommonModule } from '@angular/common';
import { Component, computed, HostListener, inject, Input, ElementRef } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CompetitionService } from '../../../core/services/competition.service';
import { COMPETITIONS, USER_ROLES } from '../../../core/models/auth.model';

@Component({
  selector: 'cnh-topnav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './topnav.html',
  styleUrl: './topnav.scss'
})
export class Topnav {
  @Input() isLoggedIn = false;

  isProfileMenuOpen = false;
  isMobileMenuOpen = false;

  readonly authService = inject(AuthService);
  readonly competitionService = inject(CompetitionService);
  private router = inject(Router);

  readonly showCompetitionToggle = computed(() =>
    this.competitionService.canToggleCompetition()
  );

  readonly isNewHolland = computed(() =>
    this.competitionService.activeCompetition() === COMPETITIONS.NEW_HOLLAND
  );


  readonly isSaleUser = computed(() =>
    this.authService.getUserRole() === USER_ROLES.CNH_SALES
  );

  constructor(private elRef: ElementRef) { }


  toggleProfileMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isMobileMenuOpen = false;
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen = false;
  }

  toggleCompetition(): void {
    this.competitionService.toggleCompetition();
  }


  toggleMobileMenu(): void {
    this.isProfileMenuOpen = false;
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeProfileMenu();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.isProfileMenuOpen) return;

    const clickedInside = this.elRef.nativeElement.contains(event.target);

    if (!clickedInside) {
      this.closeProfileMenu();
    }
  }

  logout() {
    this.authService.logout();
    this.closeProfileMenu();
    this.competitionService.clearCompetitionSelection();
    this.router.navigate(['/login']);
  }

}