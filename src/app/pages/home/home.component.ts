import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { OlympicService } from '@services/olympic.service';
import { Olympic } from '@models/Olympic';
import { ChartData, ChartOptions, TooltipItem  } from 'chart.js';
import { CountryColorService } from '@services/country-color.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  
  // Tableau pour stocker les données olympiques
  olympics: Olympic[] = [];
  totalJO: number = 0;
  totalCountries: number = 0;

  // Sujet pour gérer la destruction des observables
  private destroy$ = new Subject<void>();

  // Options pour configurer le graphique en camembert
  chartOptions: ChartOptions<'pie'> = {
    animation: {
      duration: 0 
    },
    plugins: {
      legend: {
        display: false 
      },
      tooltip: {
        backgroundColor: '#04838f', 
        titleFont: {
          size: 16,
          weight: 'normal',
          family: 'Arial, sans-serif'
        },
        bodyFont: {
          size: 14, 
          family: 'Arial, sans-serif'
        },
        callbacks: {
          title: (tooltipItems: TooltipItem<'pie'>[]) => {
            return tooltipItems[0].label; 
          },
          label: (tooltipItem: TooltipItem<'pie'>) => {
            const totalMedal = tooltipItem.raw as number;
            return [`🏅 ${totalMedal}`]; 
          }
        },
        bodyAlign: 'center', 
        titleAlign: 'center', 
        bodySpacing: 6,
        displayColors: false,
        padding: 12,
        boxPadding: 8 
      }
    },
    hover: {
      mode: 'nearest', 
    }
  };

  constructor(
    private olympicService: OlympicService, 
    private countryColorService: CountryColorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Charge les données olympiques et observe leur mise à jour
    this.olympicService.loadInitialData().pipe(
      takeUntil(this.destroy$) // Annule l'abonnement à la destruction du composant
    ).subscribe({
      next: (data) => {
        this.olympics = data.filter(o => o.country && o.totalMedal !== undefined); 
        this.totalCountries = this.olympicService.calculateTotalCountries(this.olympics);
        this.totalJO = this.olympicService.calculateTotalJO(this.olympics);
      },
      error: (err) => console.error(err),
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getCountryColor(country: string): string {
    return this.countryColorService.getColorForCountry(country);
  }

  // Génère les données pour le graphique en camembert
  getChartData(): ChartData<'pie', number[], string> {
    return {
      labels: this.getChartLabels(),
      datasets: [{
        data: this.olympics.map(o => o.totalMedal),
        backgroundColor: this.olympics.map(o => this.getCountryColor(o.country)),
        hoverBackgroundColor: this.olympics.map(o => this.getCountryColor(o.country)),
        hoverBorderColor: '#000000',
        hoverBorderWidth: 2
      }]
    };
  }

  getChartLabels(): string[] {
    return this.olympics.map(o => o.country).filter(c => c !== undefined); // Noms des pays
  }

  onChartClick(event: any): void {
    const clickedCountryIndex = event.active[0]?.index;
    if (clickedCountryIndex !== undefined) {
      const clickedCountry = this.olympics[clickedCountryIndex]; // Données du pays cliqué
      const color = this.getCountryColor(clickedCountry.country);
      this.countryColorService.setSelectedCountryColor(color);
      this.router.navigate(['/country-details', clickedCountry.id]);
    }
  }
}

