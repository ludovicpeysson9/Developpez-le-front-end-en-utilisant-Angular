import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, catchError, tap, map, of, Subject, ReplaySubject } from 'rxjs';
import { Olympic } from '@models/Olympic';
import { Participation } from '@models/Participation';

@Injectable({
  providedIn: 'root',
})
export class OlympicService implements OnDestroy {
  private olympicUrl = './assets/mock/olympic.json';
  private olympics$ = new ReplaySubject<Olympic[]>(1);
  private destroy$ = new Subject<void>();

  private static minMedals: number = Number.MAX_VALUE;
  private static maxMedals: number = Number.MIN_VALUE;
  private yearCityMap = new Map<number, string>();

  private selectedCountryColor$ = new ReplaySubject<string>(1);

  constructor(private http: HttpClient) {}

  loadInitialData(): Observable<Olympic[]> {
    return this.http.get<Olympic[]>(this.olympicUrl).pipe(
      map((data: Olympic[]) => data.map(item => this.transformToOlympic(item))),
      tap((olympics) => {
        this.olympics$.next(olympics);
        this.calculateMedalBounds(olympics);
        this.populateYearCityMap(olympics);
      }),
      catchError((error) => {
        console.error('Failed to load initial data', error);
        return of([]);
      })
    );
  }
  
  private transformToOlympic(data: Olympic): Olympic {
    const totalMedal = data.participations.reduce((sum: number, p: Participation) => sum + p.medalsCount, 0);
    return {
      id: data.id,
      country: data.country,
      totalMedal: totalMedal,
      participations: data.participations.map(p => this.transformToParticipation(p)),
    };
  }

  private transformToParticipation(data: Participation): Participation {
    return {
      id: data.id,
      year: data.year,
      city: data.city,
      medalsCount: data.medalsCount,
      athleteCount: data.athleteCount,
    };
  }

  getOlympics(): Observable<Olympic[]> {
    return this.olympics$.asObservable();
  }

  private calculateMedalBounds(olympics: Olympic[]): void {
    const medals = olympics.flatMap(o => o.participations.map(p => p.medalsCount));
    const visibilityMargin: number = 20; // Margin to enhance the visibility of the chart
    
    OlympicService.minMedals = Math.max(0, Math.min(...medals) - visibilityMargin);
    OlympicService.maxMedals = Math.max(...medals) + visibilityMargin;
  }

  private populateYearCityMap(olympics: Olympic[]): void {
    olympics.forEach(o => {
      o.participations.forEach(p => {
        this.yearCityMap.set(p.year, p.city);
      });
    });
  }

  getMinMedals(): number {
    return OlympicService.minMedals;
  }

  getMaxMedals(): number {
    return OlympicService.maxMedals;
  }

  getYearCityMap(): Map<number, string> {
    return this.yearCityMap;
  }

  setSelectedCountryColor(color: string): void {
    this.selectedCountryColor$.next(color);
  }

  getSelectedCountryColor(): Observable<string> {
    return this.selectedCountryColor$.asObservable();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}

