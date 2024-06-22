import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, catchError, tap, map, of, Subject, ReplaySubject } from 'rxjs';
import { Olympic } from '@models/Olympic';
import { Participation } from '@models/Participation';
import { ChartData } from 'chart.js';

@Injectable({
  providedIn: 'root',
})
export class OlympicService implements OnDestroy {
  private olympicUrl = './assets/mock/olympic.json';
  private olympics$ = new ReplaySubject<Olympic[]>(1); // Stocke les données des Jeux Olympiques
  private destroy$ = new Subject<void>(); // Utilisé pour nettoyer les observables lors de la destruction du service

  private static minMedals: number = Number.MAX_VALUE;
  private static maxMedals: number = Number.MIN_VALUE;
  private yearCityMap = new Map<number, string>();

  constructor(private http: HttpClient) {}


  /**
   * Charge les données initiales des Jeux Olympiques.
   * @returns Un observable avec les données des Jeux Olympiques.
   */
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
  
  /**
   * Transforme les données pour ajouter le total des médailles.
   * @param data Les données olympiques brutes.
   * @returns Les données olympiques avec le total des médailles calculé.
   */
  private transformToOlympic(data: Olympic): Olympic {
    const totalMedal = data.participations.reduce((sum: number, p: Participation) => sum + p.medalsCount, 0);
    return {
      id: data.id,
      country: data.country,
      totalMedal: totalMedal,
      participations: data.participations.map(p => this.transformToParticipation(p)),
    };
  }

  /**
   * Assure la transformation des données de participation.
   * @param data Les données de participation brutes.
   * @returns Les données de participation transformées.
   */
  private transformToParticipation(data: Participation): Participation {
    return {
      id: data.id,
      year: data.year,
      city: data.city,
      medalsCount: data.medalsCount,
      athleteCount: data.athleteCount,
    };
  }


  /**
   * Retourne les données des Jeux Olympiques.
   * @returns Un observable des données des Jeux Olympiques.
   */
  getOlympics(): Observable<Olympic[]> {
    return this.olympics$.asObservable();
  }

  /**
   * Calcule les bornes pour le graphique.
   * @param olympics Les données des Jeux Olympiques.
   */
  private calculateMedalBounds(olympics: Olympic[]): void {
    const medals = olympics.flatMap(o => o.participations.map(p => p.medalsCount));
    const visibilityMargin: number = 20; // Marge afin de rendre le graphique plus lisible
    
    OlympicService.minMedals = Math.max(0, Math.min(...medals) - visibilityMargin);
    OlympicService.maxMedals = Math.max(...medals) + visibilityMargin;
  }

  /**
   * Remplit la map des années et des villes.
   * @param olympics Les données des Jeux Olympiques.
   */
  private populateYearCityMap(olympics: Olympic[]): void {
    olympics.forEach(o => {
      o.participations.forEach(p => {
        this.yearCityMap.set(p.year, p.city);
      });
    });
  }

  /**
   * @returns Le nombre minimum de médailles.
   */
  getMinMedals(): number {
    return OlympicService.minMedals;
  }

  /**
   * @returns Nombre maximum de médailles.
   */
  getMaxMedals(): number {
    return OlympicService.maxMedals;
  }

  /**
   * @returns Map associant les années aux villes.
   */
  getYearCityMap(): Map<number, string> {
    return this.yearCityMap;
  }

  // Recuperer les Statistiques et les Données du Graphique
  getStatistics(olympic: Olympic): { totalEntries: number; totalMedals: number; totalAthletes: number } {
    return {
      totalEntries: olympic.participations.length,
      totalMedals: olympic.participations.reduce((sum, p) => sum + p.medalsCount, 0),
      totalAthletes: olympic.participations.reduce((sum, p) => sum + p.athleteCount, 0),
    };
  }

  createChartData(olympic: Olympic, countryColor: string): ChartData<'line'> {
    return {
      labels: olympic.participations.map(p => p.year.toString()),
      datasets: [
        {
          label: 'Nombre de médailles',
          data: olympic.participations.map(p => p.medalsCount),
          borderColor: countryColor,
          fill: false,
          borderWidth: 2,
          pointBackgroundColor: countryColor,
          pointBorderColor: countryColor,
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: countryColor,
        }
      ]
    };
  }

  // Calcul du nombre total de pays
  calculateTotalCountries(olympics: Olympic[]): number {
    return new Set(olympics.map(o => o.country)).size;
  }

  // Calcule du nombre total de Jeux Olympiques
  calculateTotalJO(olympics: Olympic[]): number {
    const uniqueYears = new Set<number>();
    olympics.forEach(o => {
      o.participations.forEach(p => uniqueYears.add(p.year));
    });
    return uniqueYears.size;
  }

  /**
   * Nettoie les observables lors de la destruction du service.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}

