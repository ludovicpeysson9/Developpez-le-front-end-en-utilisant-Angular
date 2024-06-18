import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { CountryColor } from '@models/CountryColor';

@Injectable({
    providedIn: 'root',
})
export class CountryColorService {

    private countryColors: CountryColor[] = [
        { country: 'Germany', color: '#793D52' },
        { country: 'United States', color: '#89A1DB' },
        { country: 'France', color: '#9780A1' },
        { country: 'United Kingdom', color: '#BFE0F1' },
        { country: 'Spain', color: '#B8CBE7' },
        { country: 'Italy', color: '#956065' },
    ];

    private selectedCountryColor$ = new ReplaySubject<string>(1);

    // Méthode pour obtenir la couleur d'un pays
    getColorForCountry(country: string): string {
        const countryColor = this.countryColors.find(cc => cc.country === country);
        return countryColor ? countryColor.color : '#000000'; // Couleur par défaut
    }

    // Méthode pour obtenir toutes les couleurs
    getAllCountryColors(): CountryColor[] {
        return this.countryColors;
    }

    // Méthode pour définir la couleur du pays sélectionné
    setSelectedCountryColor(color: string): void {
        this.selectedCountryColor$.next(color);
    }

    // Méthode pour obtenir la couleur du pays sélectionné
    getSelectedCountryColor(): Observable<string> {
        return this.selectedCountryColor$.asObservable();
    }
}
