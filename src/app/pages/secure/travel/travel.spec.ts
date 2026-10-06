import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Travel } from './travel';
import { AuthService } from '../../../core/services/auth.service';
import { CompetitionService } from '../../../core/services/competition.service';
import { COMPETITION_CONFIG } from '../../../core/config/competition.config';
import { UserRole } from '../../../core/models/auth.model';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environments';

describe('Travel role views', () => {
  const role = signal<UserRole>('cnh-sales');
  const competition = signal('case-steyr');

  beforeEach(async () => {
    role.set('cnh-sales');
    competition.set('case-steyr');
    await TestBed.configureTestingModule({
      imports: [Travel],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
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
  ] as const)('keeps the previous page visible for %s', (userRole, audience, destination, date) => {
    role.set(userRole);
    const fixture = TestBed.createComponent(Travel);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('h1')).toBeNull();
    expect(element.textContent).toContain('SAVE THE DATE');
    expect(element.querySelector('.travel-info__date')?.textContent).toBe(date);
    expect(element.querySelector('.travel-audience')).toBeNull();
    expect(element.querySelector('.travel-hero')).toBeNull();
    expect(element.textContent).not.toContain(destination);
    expect(element.textContent).toContain('Reservieren Sie sich diesen Zeitraum vorsorglich.');
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(`${environment.apiUrl}/v1/cnh/travel/images`).flush({
      success: true,
      images: [{ name: 'Bisheriges Reisebild', url: `${environment.apiUrl}/media/cnh/reise/images/old.jpg` }],
    });
    fixture.detectChanges();
    const images = Array.from(element.querySelectorAll('.travel-tile > img'));
    expect(images).toHaveLength(1);
    expect(images[0].getAttribute('src')).toBe(`${environment.apiUrl}/media/cnh/reise/images/old.jpg`);
    http.verify();
    fixture.componentInstance.setAudience(audience === 'sales' ? 'management' : 'sales');
    expect(fixture.componentInstance.audience()).toBe(audience);
  });

  it.each(['sysadmin', 'vipp-admin', 'cnh-admin', 'warehouse-admin'] as const)(
    'allows %s to switch all three views', adminRole => {
      role.set(adminRole);
      const fixture = TestBed.createComponent(Travel);
      fixture.detectChanges();
      const element: HTMLElement = fixture.nativeElement;
      expect(element.querySelector('cnh-travel-legacy')).toBeNull();
      TestBed.inject(HttpTestingController).expectNone(`${environment.apiUrl}/v1/cnh/travel/images`);
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
    expect(fixture.nativeElement.querySelector('.travel-hero')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('SAVE THE DATE');
    TestBed.inject(HttpTestingController).expectOne(`${environment.apiUrl}/v1/cnh/travel/images`)
      .flush({ success: true, images: [] });
  });

  it('selects new pictures when the page is reopened, but keeps them stable during a visit', () => {
    role.set('sysadmin');
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
