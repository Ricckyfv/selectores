import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountry } from '../../interfaces/country.interfaces';
import { filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: [
  ]
})
export class SelectorPageComponent implements OnInit{

  public countriesByRegion: SmallCountry[] = [];
  public borders:SmallCountry[] = [];

  public myForm: FormGroup = this.fb.group({
    region: ['', Validators.required],
    country: ['', Validators.required],
    border: ['', Validators.required],
  })

  constructor(
    private fb: FormBuilder,
    private countriesService: CountriesService
  ){}

  ngOnInit(): void {
    this.onRegionChanged();
    this.onCountryChanged();
  }

    get regions(): Region[]{
      return this.countriesService.regions;
    }

    onRegionChanged(): void{

      this.myForm.get('region')!.valueChanges
      .pipe(
        tap( () => this.myForm.get('country')!.setValue('')),
        tap( () => this.borders = []),
        switchMap( region => this.countriesService.getCountryByRegion(region)),
      )
      .subscribe( countries => {
        this.countriesByRegion = countries;
      })
    }

    onCountryChanged(): void{

      this.myForm.get('country')!.valueChanges
      .pipe(
        tap( () => this.myForm.get('border')!.setValue('')), //Para resetear el valor
        filter( (value:string) => value.length > 0), //Equivale a if( !region) return of([]); en la f de nuestro service
        switchMap( alphaCode => this.countriesService.getCountryByAlphaCode( alphaCode )),
        switchMap( country => this.countriesService.getCountryBordersByCodes( country.borders )),
      )
      .subscribe( countries => {
        this.borders = countries;
      })
    }
}
