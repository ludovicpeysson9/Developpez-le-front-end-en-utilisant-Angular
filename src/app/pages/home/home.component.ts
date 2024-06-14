import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { Olympic } from 'src/app/core/models/Olympic';
import { ChartData, ChartOptions, TooltipItem  } from 'chart.js';
import { CountryColor } from 'src/app/core/models/CountryColor';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  
  olympics: Olympic[] = [];
  totalJO: number = 0;
  totalCountries: number = 0;

  private destroy$ = new Subject<void>();

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

  countryColors: CountryColor[] = [
    { country: 'Germany', color: '#793D52' },
    { country: 'United States', color: '#89A1DB' },
    { country: 'France', color: '#9780A1' },
    { country: 'United Kingdom', color: '#BFE0F1' },
    { country: 'Spain', color: '#B8CBE7' },
    { country: 'Italy', color: '#956065' },
  ];

  constructor(private olympicService: OlympicService, private router: Router) {}

  ngOnInit(): void {
    this.olympicService.loadInitialData().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.olympics = data.filter(o => o.country && o.totalMedal !== undefined);
        this.calculateTotals();
      },
      error: (err) => console.error(err),
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  calculateTotals(): void {
    const uniqueCountries = new Set(this.olympics.map(o => o.country));
    const uniqueYears = new Set<number>();
    this.olympics.forEach(o => {
      o.participations.forEach(p => uniqueYears.add(p.year));
    });
    this.totalCountries = uniqueCountries.size;
    this.totalJO = uniqueYears.size;
  }

  getCountryColor(country: string): string | undefined {
    const countryColor = this.countryColors.find(cc => cc.country === country);
    return countryColor ? countryColor.color : '#000000';
  }


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
    return this.olympics.map(o => o.country).filter(c => c !== undefined);
  }

  onChartClick(event: any): void {
    const clickedCountryIndex = event.active[0]?.index;
    if (clickedCountryIndex !== undefined) {
      const clickedCountry = this.olympics[clickedCountryIndex];
      const color = this.getCountryColor(clickedCountry.country);
      this.router.navigate(['/country-details', clickedCountry.id], {
        queryParams: { color: color }
      });
    }
  }
}

