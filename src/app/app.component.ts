import { Component, ElementRef, OnInit} from '@angular/core';
import { DataService } from './services/data.service';
import { I18nService } from './services/I18nService';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',  
  styleUrls: ['./app.component.css'],
  providers: [ DataService, I18nService ]
})
export class AppComponent implements  OnInit {
  loading: boolean;
  imagePath: string;
  locale: string;
  countryApi: string;  
  headQuarterApi: string;  
  monthYearApi: string;  
  documetId: string;
  downloadBy: string;
  index: string; 
  title: string; 
  i18n: any = {}; 
  countryLabel: string;
  headQuarterLabel: string;
  monthOrYearLabel: string;
  displayUrl: string;
  urlSplit: any[] = [];
  queryParams: any[] = [];  
  disclaimerText: string = "";  

  constructor(private element: ElementRef, private dataService: DataService) {
    this.loading = true;
    this.imagePath = this.element.nativeElement.getAttribute('imagePath'); 
    this.locale = this.element.nativeElement.getAttribute('locale');
    this.countryApi = this.element.nativeElement.getAttribute('country-api');    
    this.headQuarterApi = this.element.nativeElement.getAttribute('head-quarter-api');    
    this.monthYearApi = this.element.nativeElement.getAttribute('month-year-api');       

    this.i18n = I18nService.ALL_LOCALES[this.locale];    
    this.countryLabel = this.i18n.country;
    this.headQuarterLabel = this.i18n.headQuarter;
    this.monthOrYearLabel = this.i18n.monthOryear;
    this.disclaimerText = this.i18n.disclaimerText;
  }

  ngOnInit(){
    $("#divCountry").show();
    $("#divhead").hide();
    $("#divMonth").hide();
    this.displayUrl = window.location.href;
   
  if(this.displayUrl.length>0){
    this.urlSplit=this.displayUrl.split('?');
    
    if(this.urlSplit.length>1){
      this.queryParams = this.urlSplit[1].split('&');
      this.documetId=this.queryParams[0].split('docid=')[1];
      if(this.queryParams[1]!=null){
        this.downloadBy = this.queryParams[1].split('type=')[1];
      }

      if (this.downloadBy == "country") {
        this.index = "1";
      } else if (this.downloadBy == "head-quarter") {
        this.index = "2";      
      } else if (this.downloadBy == "month-year") {
        this.index = "3";
      } else {
        this.index = "1";
      }                  
    }
  }



  }
  tab(type,event){
    this.loading = true;  
   $(".nav li a").removeClass('menu-active');
    event.target.classList.add('menu-active');
    if(type==1){
      this.index = "1";
      $("#divCountry").show();
      $("#divhead").hide();
      $("#divMonth").hide();
    }else if(type==2){
      this.index = "2";
      $("#divCountry").hide();
      $("#divhead").show();
      $("#divMonth").hide();
    }else if(type==3){
      this.index = "3";
      $("#divCountry").hide();
      $("#divhead").hide();
      $("#divMonth").show();
    }
    setTimeout(() => {
      this.loading = false; 
 }, 1000);
     
  }
  public getTabType(type) {  
    this.loading = true;  
  }

  public updateValues(values) {    
    this.loading = values.loading;
    this.title = values.title;
  } 
  
}
