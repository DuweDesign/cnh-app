import { CommonModule } from '@angular/common';
import { Component, computed, HostListener, inject, Input, ElementRef, effect } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CompetitionService } from '../../../core/services/competition.service';
import { NewsStatusService } from '../../../core/services/news-status.service';
import { COMPETITIONS, USER_ROLES } from '../../../core/models/auth.model';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

type CompetitionSelectValue = 'case-steyr' | 'new-holland' | 'warehouse';

@Component({
  selector: 'cnh-topnav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './topnav.html',
  styleUrl: './topnav.scss'
})
export class Topnav {
  @Input() isLoggedIn = false;

  isProfileMenuOpen = false;
  isMobileMenuOpen = false;

  competitionSelect: CompetitionSelectValue = 'case-steyr';

  readonly authService = inject(AuthService);
  readonly competitionService = inject(CompetitionService);
  readonly newsStatusService = inject(NewsStatusService);
  private router = inject(Router);

  readonly showCompetitionToggle = computed(() =>
    this.competitionService.canToggleCompetition()
  );

  readonly isNewHolland = computed(() =>
    this.competitionService.activeCompetition() === COMPETITIONS.NEW_HOLLAND
  );
  
  readonly isCaseSteyr = computed(() =>
    this.competitionService.activeCompetition() === COMPETITIONS.CASE_STEYR
  );
  
  readonly isWarehouse = computed(() =>
    this.competitionService.activeCompetition() === COMPETITIONS.WAREHOUSE
  );

  readonly hasUnreadNews = this.newsStatusService.hasUnreadNews;

  readonly isSaleUser = computed(() =>
    this.authService.getUserRole() === USER_ROLES.CNH_SALES
  );

  readonly isWarehouseUser = computed(() =>
    this.authService.getUserRole() === USER_ROLES.CNH_WAREHOUSE
  );

  readonly isAdmin = computed(() => {
    const role = this.authService.getUserRole();
    return ['sysadmin', 'vipp-admin'].includes(role ?? '');
  });

  readonly isWarehousAdmin = computed(() =>
    this.authService.getUserRole() === USER_ROLES.WAREHOUSE_ADMIN
  );

  readonly isCnhAdmin = computed(() =>
    this.authService.getUserRole() === USER_ROLES.CNH_ADMIN
  );

  constructor(private elRef: ElementRef) {
    effect(() => {
      const activeCompetition = this.competitionService.activeCompetition();

      if (
        activeCompetition === COMPETITIONS.CASE_STEYR ||
        activeCompetition === COMPETITIONS.NEW_HOLLAND ||
        activeCompetition === COMPETITIONS.WAREHOUSE
      ) {
        this.competitionSelect = activeCompetition;
      }
    });
  }


  toggleProfileMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isMobileMenuOpen = false;
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  onCompetitionSelectChange(value: string): void {
    if (!this.isCompetitionSelectValue(value)) {
      return;
    }

    this.competitionSelect = value;

    switch (value) {
      case 'case-steyr':
        this.competitionService.setCompetition(COMPETITIONS.CASE_STEYR);
        break;

      case 'new-holland':
        this.competitionService.setCompetition(COMPETITIONS.NEW_HOLLAND);
        break;

      case 'warehouse':
        this.competitionService.setCompetition(COMPETITIONS.WAREHOUSE);
        break;
    }
  }

  private isCompetitionSelectValue(value: string): value is CompetitionSelectValue {
    return ['case-steyr', 'new-holland', 'warehouse'].includes(value);
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
