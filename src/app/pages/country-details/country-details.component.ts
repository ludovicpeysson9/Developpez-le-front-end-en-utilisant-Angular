import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OlympicService } from '@services/olympic.service';
import { Olympic } from '@models/Olympic';
import { ChartData, ChartOptions } from 'chart.js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CountryColorService } from '@app/core/services/country-color.service';

@Component({
  selector: 'app-country-details',
  templateUrl: './country-details.component.html',
  styleUrls: ['./country-details.component.scss']
})
export class CountryDetailsComponent implements OnInit, OnDestroy {
  olympic: Olympic | undefined; // Objet représentant les données du pays sélectionné
  chartData: ChartData<'line'> = { datasets: [] }; // Données pour le graphique
  chartOptions: ChartOptions<'line'> = this.getChartOptions(); // Options de configuration du graphique
  totalEntries = 0;
  totalMedals = 0;
  totalAthletes = 0;
  countryColor = '#04838f';

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private countryColorService: CountryColorService,
    private olympicService: OlympicService
  ) { }

  ngOnInit(): void {
    // Méthode pour charger les données basées sur l'ID du pays
    this.initializeRouteParams();

    this.countryColorService.getSelectedCountryColor()
      .pipe(takeUntil(this.destroy$))
      .subscribe(color => {
        this.countryColor = color || '#04838f';
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Initialiser les paramètres de l'URL et charger les données
  private initializeRouteParams(): void {
    this.route.paramMap.subscribe(paramMap => {
      const id = Number(paramMap.get('id')); // Conversion de l'ID en nombre
      if (!isNaN(id)) { // Vérifier que l'ID est un nombre valide
        this.loadCountryData(id); // Chargement des données du pays
      } else {
        console.error('Invalid country ID');
      }
    });
  }

  private loadCountryData(id: number): void {
    this.olympicService.loadInitialData().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.olympic = data.find(o => o.id === id);
        if (this.olympic) {
          const stats = this.olympicService.getStatistics(this.olympic);  // Utilisation de la méthode du service pour les statistiques
          this.totalEntries = stats.totalEntries;
          this.totalMedals = stats.totalMedals;
          this.totalAthletes = stats.totalAthletes;
          this.chartData = this.olympicService.createChartData(this.olympic, this.countryColor);  // Utilisation de la méthode du service pour les données du graphique
          this.updateChartOptions();
        }
      },
      error: (err) => console.error(err),
    });
  }

  private updateChartOptions(): void {
    this.chartOptions.scales!['y']!.min = this.olympicService.getMinMedals();
    this.chartOptions.scales!['y']!.max = this.olympicService.getMaxMedals();
  }

  private getChartOptions(): ChartOptions<'line'> {
    return {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleFont: {
            size: 16,
            weight: 'bold',
            family: 'Arial, sans-serif'
          },
          bodyFont: {
            size: 14,
            family: 'Arial, sans-serif'
          },
          titleColor: '#FFFFFF',
          bodyColor: '#FFFFFF',
          callbacks: {
            title: (context) => {
              const year = context[0].label || '';
              const city = this.olympicService.getYearCityMap().get(parseInt(year));
              return `${year} - ${city}`;
            },
            label: (context) => {
              const year = context.label || '';
              const medals = context.raw as number;
              const athletes = this.olympic?.participations.find(p => p.year.toString() === year)?.athleteCount || 0;
              return [
                `Médailles: ${medals}`,
                `Athlètes: ${athletes}`
              ];
            }
          },
          displayColors: false,
          padding: 10,
          boxPadding: 5
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Années',
            font: {
              family: 'Arial, sans-serif',
              size: 14,
              weight: 'bold',
            }
          }
        },
        y: {
          title: {
            display: true,
            text: 'Nombre de médailles',
            font: {
              family: 'Arial, sans-serif',
              size: 14,
              weight: 'bold',
            }
          }
        }
      }
    };
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
