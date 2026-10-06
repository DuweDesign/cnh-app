import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Travel } from './travel';
import { AuthService } from '../../../core/services/auth.service';
import { CompetitionService } from '../../../core/services/competition.service';
import { COMPETITION_CONFIG } from '../../../core/config/competition.config';
import { UserRole } from '../../../core/models/auth.model';

describe('Travel role views', () => {
  const role = signal<UserRole>('cnh-sales');
  const competition = signal('case-steyr');

  beforeEach(async () => {
    role.set('cnh-sales');
    competition.set('case-steyr');
    await TestBed.configureTestingModule({
      imports: [Travel],
      providers: [
        {
          provide: AuthService,
          useValue: {
            getUserRole: () => role(),
            isAdmin: () => ['sysadmin', 'vipp-admin', 'cnh-admin', 'warehouse-admin'].includes(role()),
          },
        },
        {
          provide: CompetitionService,
          useValue: {
            activeCompetition: competition,
            competitionConfig: signal(COMPETITION_CONFIG['case-steyr']),
          },
        },
      ],
    }).compileComponents();
  });

  it.each([
    ['cnh-sales', 'sales', 'Lofoten', '06. - 10. März 2027'],
    ['cnh-management', 'management', 'Mauritius', '12. - 19. März 2027'],
    ['cnh-warehouse', 'warehouse', 'Irland', '07. - 11. April 2027'],
  ] as const)('renders the correct content for %s', (userRole, audience, destination, date) => {
    role.set(userRole);
    const fixture = TestBed.createComponent(Travel);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('h1')?.textContent).toBe(destination);
    expect(element.querySelector('.travel-info__date')?.textContent).toBe(date);
    expect(element.querySelector('.travel-audience')).toBeNull();
    const images = Array.from(element.querySelectorAll('.travel-tile > img'));
    expect(images).toHaveLength(12);
    expect(new Set(images.map(image => image.getAttribute('src'))).size).toBe(12);
    for (const paragraph of fixture.componentInstance.content().paragraphs) {
      expect(element.textContent).toContain(paragraph);
    }
    expect(element.querySelector('.travel-hero h1')).not.toBeNull();
    expect(images.every(image => image.getAttribute('src')?.includes(`/images/${audience}/`))).toBe(true);
    fixture.componentInstance.setAudience(audience === 'sales' ? 'management' : 'sales');
    expect(fixture.componentInstance.audience()).toBe(audience);
  });

  it.each(['sysadmin', 'vipp-admin', 'cnh-admin', 'warehouse-admin'] as const)(
    'allows %s to switch all three views', adminRole => {
      role.set(adminRole);
      const fixture = TestBed.createComponent(Travel);
      fixture.detectChanges();
      const element: HTMLElement = fixture.nativeElement;
      const buttons = Array.from(element.querySelectorAll<HTMLButtonElement>('.travel-audience button'));
      expect(buttons).toHaveLength(3);
      for (const [index, destination] of ['Lofoten', 'Mauritius', 'Irland'].entries()) {
        buttons[index].click();
        fixture.detectChanges();
        expect(element.querySelector('h1')?.textContent).toBe(destination);
        expect(buttons[index].getAttribute('aria-pressed')).toBe('true');
        expect(fixture.componentInstance.images().every(image =>
          image.url.includes(`/images/${fixture.componentInstance.audience()}/`))).toBe(true);
      }
    }
  );

  it('keeps a participant view tied to their role when the competition changes', () => {
    role.set('cnh-management');
    const fixture = TestBed.createComponent(Travel);
    competition.set('warehouse');
    expect(fixture.componentInstance.audience()).toBe('management');
  });

  it('discards the admin preview when the authenticated role changes', () => {
    role.set('sysadmin');
    const fixture = TestBed.createComponent(Travel);
    fixture.componentInstance.setAudience('warehouse');
    role.set('cnh-sales');
    fixture.detectChanges();
    expect(fixture.componentInstance.audience()).toBe('sales');
    expect(fixture.nativeElement.querySelector('.travel-audience')).toBeNull();
  });

  it('selects new pictures when the page is reopened, but keeps them stable during a visit', () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0.1);
    try {
      const first = TestBed.createComponent(Travel);
      first.detectChanges();
      const firstUrls = first.componentInstance.images().map(image => image.url);
      competition.set('new-holland');
      first.detectChanges();
      expect(first.componentInstance.images().map(image => image.url)).toEqual(firstUrls);
      first.destroy();

      random.mockReturnValue(0.9);
      const second = TestBed.createComponent(Travel);
      second.detectChanges();
      const secondUrls = second.componentInstance.images().map(image => image.url);
      expect(secondUrls).not.toEqual(firstUrls);
      expect(secondUrls).toHaveLength(12);
      expect(new Set(secondUrls).size).toBe(12);
    } finally {
      random.mockRestore();
    }
  });
});
