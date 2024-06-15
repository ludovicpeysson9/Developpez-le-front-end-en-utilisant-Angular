import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OlympicService } from '@services/olympic.service';
import { Olympic } from '@models/Olympic';
import { ChartData, ChartOptions } from 'chart.js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-country-details',
  templateUrl: './country-details.component.html',
  styleUrls: ['./country-details.component.scss']
})
export class CountryDetailsComponent implements OnInit, OnDestroy {
  olympic: Olympic | undefined;
  chartData: ChartData<'line'> = { datasets: [] };
  chartOptions: ChartOptions<'line'> = this.getChartOptions();
  totalEntries = 0;
  totalMedals = 0;
  totalAthletes = 0;
  countryColor = '#04838f';

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private olympicService: OlympicService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(paramMap => {
      const id = Number(paramMap.get('id'));
      this.loadCountryData(id);
    });

    this.olympicService.getSelectedCountryColor()
      .pipe(takeUntil(this.destroy$))
      .subscribe(color => {
        this.countryColor = color || '#04838f';
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCountryData(id: number): void {
    this.olympicService.loadInitialData().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.olympic = data.find(o => o.id === id);
        if (this.olympic) {
          this.updateStatistics(this.olympic);
          this.chartData = this.createChartData(this.olympic);
          this.updateChartOptions();
        }
      },
      error: (err) => console.error(err),
    });
  }

  private updateStatistics(olympic: Olympic): void {
    this.totalEntries = olympic.participations.length;
    this.totalMedals = olympic.participations.reduce((sum, p) => sum + p.medalsCount, 0);
    this.totalAthletes = olympic.participations.reduce((sum, p) => sum + p.athleteCount, 0);
  }

  private createChartData(olympic: Olympic): ChartData<'line'> {
    return {
      labels: olympic.participations.map(p => p.year.toString()),
      datasets: [
        {
          label: 'Nombre de médailles',
          data: olympic.participations.map(p => p.medalsCount),
          borderColor: this.countryColor,
          fill: false,
          borderWidth: 2,
          pointBackgroundColor: this.countryColor,
          pointBorderColor: this.countryColor,
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: this.countryColor,
        }
      ]
    };
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
