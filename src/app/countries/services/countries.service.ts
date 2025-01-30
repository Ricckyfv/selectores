import { Injectable } from '@angular/core';
import { Country, Region, SmallCountry } from '../interfaces/country.interfaces';
import { combineLatest, map, Observable, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  private baseUrl: string = 'https://restcountries.com/v3.1';

  private _regions: Region[] = [Region.Africa, Region.Americas, Region.Asia, Region.Europe, Region.Oceania];

  constructor(
    private http: HttpClient,
  ) { }

  get regions(): Region[]{
    return [...this._regions];
  }

  getCountryByRegion(region: Region): Observable<SmallCountry[]>{

    if( !region) return of([]);

    const url: string = `${this.baseUrl}/region/${region}?fields=cca3,name,borders`;


    return this.http.get<Country[]>(url)
    .pipe(
      map( countries => countries.map( country => ({  //El countries.map() hacer referencia al metodo de un array
        name: country.name.common,
        cca3: country.cca3,               //Propiedades que sacamos del interface Country
        borders: country.borders ?? []
      }))),
    )
  }

  getCountryByAlphaCode( alphaCode: string): Observable<SmallCountry>{

    const url = `${this.baseUrl}/alpha/${ alphaCode}?fields=cca3,name,borders`;

    return this.http.get<Country>(url)
    .pipe(
      map( country => ({
        name: country.name.common,
        cca3: country.cca3,               //Propiedades que sacamos del interface Country, borders es de Country y border es de SmallCountry
        borders: country.borders ?? []
      }) )

    )
  }

  getCountryBordersByCodes(borders: string[]): Observable<SmallCountry[]>{

    if(!borders || borders.length === 0) return of([]); //Si no hya borders....

    const countriesRequests: Observable<SmallCountry>[] = []; //Observable<SmallCountry>[] la misma sintaxis que Promises[], no se va a disparar hasta que nadie se suscirba a el

    borders.forEach( code => {
      const request = this.getCountryByAlphaCode( code );
      countriesRequests.push( request);
    });

    return combineLatest( countriesRequests);

  }
}
