import { Component, Input, Output, EventEmitter,OnInit } from '@angular/core';
import { DataService } from './services/data.service';
import * as Highcharts from 'highcharts';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import * as $ from "jquery";
@Component({  
	selector: 'download', 	
    templateUrl: './download.component.html',
    providers: [ DataService ]   
})

export class DownloadComponent implements  OnInit {
    @Input() locale: string;
    @Input() index: string;    
    @Input() documetId: string;
    @Input() api: string;	       
    @Output() updateValues = new EventEmitter<any>();	
    @Output() sortOut = new EventEmitter();
    @Input() downloadApi: string;	

    allDownloads: any[] = [];
    fulldatas: any[] = [];
    years: any;

    noticesShowingDetails: string;
	contractShowingDetails: string;
	planShowingDetails: string;
    p:number = 1;
	pageSize:number = 1;
	pageCount:number=20;
	count:number = 20;
    totalItems:any;
    
    downloadLabel: string;	 
    downloadLabelGroup: any = {}; 
    
    noticesTableHeaders:any;
    contractsTableHeaders: any;
    planTableHeaders: any;
    
    noticesTableHeadersGroup: any = {}; 
    contractsTableHeadersGroup: any = {}; 
    planTableHeadersGroup: any = {}; 
    
    noticesTableHeadersProperties: any[] = []; 
    contractsTableHeadersProperties: any[] = []; 
    plansTableHeadersProperties: any[] = []; 
    reverse: boolean=false
    istwenty:boolean=false;
    isfifty:boolean=false;
    ishundred:boolean=false;
    loading: boolean;
    loadMoreLabel: string;
    loadMoreLabelGroup: any = {}; 
    leftArrow: string;
	rightArrow: string;	
	sortType:string = 'asc'; 
	sortedColumns: any[] = [];
    //selectedYearLevel:number=0;
    tableHeaders: any[];
    dropdownArray:any[];
    view: string = "table";
    totalDownloads: string;
    buttonText:string = "Chart";

    constructor(private dataService: DataService) {   }

    ngOnChanges() {    
        this.api += "?&SortBy=&Guid=" + this.documetId;
        if (this.index == "3") {
            this.api += "&Year=ALL";
        }
        this.updateValues.emit({ loading: true, title: ""});
       
        this.dataService.getResponse(this.api).subscribe((response)=> {             
            let root = response.Root;
            let title = root.title;
            let totalDownloads = root.TOTAL_DOWNLOADS;            
            this.updateValues.emit({ loading: false, title: ""});
            if (this.index == "3") {                       
                if (root.hasOwnProperty("YEARLIST")) {   
                    let year = root.YEARLIST.YEAR;
                     
                    if (Array.isArray(year)) {
                        this.years = year;
                    } else {                       
                        this.years = Object.keys(year).map(function(key) {
                            return {[key] : year[key]};
                        });
                    }                                      
                    
                    for (let i = 0; i < this.years.length; i++) {
                        const element = this.years[i];
                        
                        if (root.hasOwnProperty("YYYY-" + element["YYYY"])) {
                            let month_year = root["YYYY-" + element["YYYY"]].Month_year;
                            
                            if(month_year.length >= 1)
                            {
                            for (let j = 0; j < month_year.length; j++) {
                                this.allDownloads.push(month_year[j]);
                            }
                             }
                           else
                            this.allDownloads.push(month_year);
                        
                        }
                    }
                }                                                   
            } else {
				 if(root.DocumentAccessCount.length >= 1)
                this.allDownloads = root.DocumentAccessCount;
				else
				 this.allDownloads.push(root.DocumentAccessCount);
            }
			
             
            this.fulldatas = this.allDownloads;
            let labels = [], totalDownloadValues = [], percentageDownloadValues = [];
            this.totalItems = this.allDownloads.length;
            if(this.totalItems<=20){
                this.pageCount = this.totalItems;
            }
			
            for (let i = 0; this.allDownloads.length > i; i++) {
                let document = this.allDownloads[i];
             
                if (this.index == "1") {                  
                    labels.push(document.Country);
                    this.getNoticesShowingDetails();
                    totalDownloadValues.push(document.NonBankAccess); 
                    percentageDownloadValues.push(+(document.Percent));       
                } else if (this.index == "2") {
                    labels.push(document.FieldOffice);
                    this.getNoticesShowingDetails();
                    totalDownloadValues.push(document.BankAccess); 
                    percentageDownloadValues.push(+(document.Percent));       
                } else if (this.index == "3") {                    
                    labels.push(document.MON + " " + document.YYYY);
                    this.getNoticesShowingDetails();
                    this.dropdownArray = this.uniqueValues(this.allDownloads,'YYYY')
                    totalDownloadValues.push(document.ACCESS_COUNT); 
                    percentageDownloadValues.push(+(document.PER));   
                }                                
            }
           
            if (this.index == "2") {
                this.totalDownloadOptions.chart.height = 400;
                this.totalDownloadOptions.plotOptions.series = { pointWidth: 40 };
                this.percentageDownloadOptions.plotOptions.series = { pointWidth: 40 };
            } else {
                this.totalDownloadOptions.chart.height = 700;
            }  

            this.totalDownloadOptions.xAxis.categories = labels;
            this.totalDownloadOptions.series[0]['data'] = totalDownloadValues;                     
            Highcharts.chart('totalDownloadsChart' + this.index, this.totalDownloadOptions);
      
            this.percentageDownloadOptions.xAxis.categories = labels;
            this.percentageDownloadOptions.series[0]['data'] = percentageDownloadValues;      
            Highcharts.chart('percentageDownloadsChart' + this.index, this.percentageDownloadOptions);             

            this.updateValues.emit({ loading: false, title: title});
            this.loading=false;
        })
    }

  
    ngOnInit(){
        setTimeout(() => {
            $("#divtables").show();
          $("#divcharts").hide();
       }, 0);
    	this.leftArrow = this.locale == 'ar' ? 'fa fa-angle-right' : 'fa fa-angle-left';
        this.rightArrow = this.locale == 'ar' ? 'fa fa-angle-left' : 'fa fa-angle-right';
		this.noticesTableHeadersGroup = { 
			'en' : 'Country/Area%%Region%%Total Downloads%%% Downloads',
			'es' : 'Country/Area%%Region%%Total Downloads%%% Downloads',
			'fr' : 'Country/Area%%Region%%Total Downloads%%% Downloads',
			'ar' : 'Country/Area%%Region%%Total Downloads%%% Downloads',
			'zh' : 'Country/Area%%Region%%Total Downloads%%% Downloads',
			'ru' : 'Country/Area%%Region%%Total Downloads%%% Downloads',
			'pt' : 'Country/Area%%Region%%Total Downloads%%% Downloads',
		}
		this.contractsTableHeadersGroup = {
			'en' : 'HQ/Country Office%%Total Downloads%%% Downloads',
			'es' : 'HQ/Country Office%%Total Downloads%%% Downloads',
			'fr' : 'HQ/Country Office%%Total Downloads%%% Downloads',
			'ar' : 'HQ/Country Office%%Total Downloads%%% Downloads',
			'zh' : 'HQ/Country Office%%Total Downloads%%% Downloads',
			'ru' : 'HQ/Country Office%%Total Downloads%%% Downloads',
			'pt' : 'HQ/Country Office%%Total Downloads%%% Downloads',

		}
		this.planTableHeadersGroup = {
			'en' : 'Year%%Month%%Total Downloads%%% Downloads',
			'es' : 'Year%%Month%%Total Downloads%%% Downloads',
			'fr' : 'Year%%Month%%Total Downloads%%% Downloads',
			'ar' : 'Year%%Month%%Total Downloads%%% Downloads',
			'zh' : 'Year%%Month%%Total Downloads%%% Downloads',
			'ru' : 'Year%%Month%%Total Downloads%%% Downloads',
			'pt' : 'Year%%Month%%Total Downloads%%% Downloads',
		}

		this.noticesTableHeadersProperties = [ 'Country', 'Region', 'NonBankAccess', 'Percent']
		this.contractsTableHeadersProperties = [ 'contr_desc_exact', 'countryshortname', 'project_name', 'procu_meth_text', 'contr_sgn_date', 'total_contr_amnt' ]
		this.plansTableHeadersProperties = [ '', 'docdt', 'repnb', 'projn', 'projectid' ]
		 
		this.loadMoreLabelGroup = {
			'en' : 'LOAD MORE',
			'es' : 'LOAD MORE',
			'fr' : 'LOAD MORE',
			'ar' : 'LOAD MORE',
			'zh' : 'LOAD MORE',
			'ru' : 'LOAD MORE',
			'pt' : 'LOAD MORE',
		}		
		
		this.downloadLabelGroup = {
			'en' : 'Download to Excel',
			'es' : 'Exportar datos a Excel',
			'fr' : 'Télécharger en Excel',
			'ar' : 'تنزيل إلى ملف Excel',
			'zh' : '下载到Excel表',
			'ru' : 'Загрузить в формате Excel',
			'pt' : 'Baixar para Excel',

		}
		this.noticesTableHeaders = this.noticesTableHeadersGroup.hasOwnProperty(this.locale) ? this.noticesTableHeadersGroup[this.locale] : {}
		this.contractsTableHeaders = this.contractsTableHeadersGroup.hasOwnProperty(this.locale) ? this.contractsTableHeadersGroup[this.locale] : {}
		this.planTableHeaders = this.planTableHeadersGroup.hasOwnProperty(this.locale) ? this.planTableHeadersGroup[this.locale] : {}
		
		this.loadMoreLabel = this.loadMoreLabelGroup.hasOwnProperty(this.locale) ? this.loadMoreLabelGroup[this.locale] : {}
		this.downloadLabel=this.downloadLabelGroup.hasOwnProperty(this.locale) ? this.downloadLabelGroup[this.locale] : {}
		
		let tableHeaders = [];

		if(this.index=='1'){
			tableHeaders=this.noticesTableHeaders.split("%%");
			this.tableHeaders = tableHeaders;		
		}
		
		if(this.index=='2'){			
			tableHeaders=this.contractsTableHeaders.split("%%");
			this.tableHeaders = tableHeaders;
		}			
		
		if(this.index=='3'){
			tableHeaders=this.planTableHeaders.split("%%");
			this.tableHeaders = tableHeaders;
		}
	}

    public totalDownloadOptions: any = {
        chart: {
            type: 'bar',            
           // width: 1200
        },
        title: {
            text: 'Total Downloads'
        },
        xAxis: {
            categories: [],
            labels: {
            enabled: true
            }          
        },   
        yAxis: {
            title: {
            text: ''      
            }
        },
        plotOptions: {
            bar: {
            dataLabels: {
                enabled: true
            }
            }
        },
        credits: {
            enabled: false
        },
        legend: {
            enabled: false
        },
        series: [{
            name: '',
            data: []
        }],
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        align: 'center',
                        verticalAlign: 'bottom',
                        layout: 'horizontal'
                    },
                    yAxis: {
                        labels: {
                            align: 'left',
                            x: 0,
                            y: -5
                        },
                        title: {
                            text: null
                        }
                    },
                    subtitle: {
                        text: null
                    },
                    credits: {
                        enabled: false
                    }
                }
            }]
        }
    } 
      
    public percentageDownloadOptions: any = {
        chart: {
            type: 'column',            
           // width: 1200
        },
        title: {
            text: '% Downloads'
        },
        xAxis: {
            categories: [],
            // crosshair: true    
        },   
        yAxis: {
            title: {
            text: ''      
            }
        },
        plotOptions: {
            bar: {
            dataLabels: {
                enabled: true
            }
            }
        },
        credits: {
            enabled: false
        },
        legend: {
            enabled: false,
            minSize:50,
  maxSize: 70,
        },
        series: [{
            name: '',
            data: []
        }],
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        align: 'center',
                        verticalAlign: 'bottom',
                        layout: 'horizontal'
                    },
                    yAxis: {
                        labels: {
                            align: 'left',
                            x: 0,
                            y: -5
                        },
                        title: {
                            text: null
                        }
                    },
                    subtitle: {
                        text: null
                    },
                    credits: {
                        enabled: false
                    }
                }
            }]
        }
    } 
    downloadExcel(){
        // jsonarray for dowloading data as excel
			let excelJsonArrayResponse=[];
			let excelJsonArrayElements= {};	 
        if(this.index=="1"){
            this.allDownloads.forEach((index) => {  
                excelJsonArrayElements = {
                    Country: index.Country,
                    Region: index.Region,
                    Total_Downloads: index.NonBankAccess,
                    Downloads: index.Percent                   
                }				
            excelJsonArrayResponse.push(excelJsonArrayElements);
            });
            this.exportAsExcelFile(excelJsonArrayResponse, 'ResultData',this.tableHeaders);
        } else if(this.index=="2"){
            this.allDownloads.forEach((index) => {  
                excelJsonArrayElements = {
                    FieldOffice: index.FieldOffice,
                    BankAccess: index.BankAccess,
                    Percent: index.Percent                   
                }				
            excelJsonArrayResponse.push(excelJsonArrayElements);
            });
            this.exportAsExcelFile(excelJsonArrayResponse, 'ResultData',this.tableHeaders);
        } else if(this.index=="3"){
            this.exportAsExcelFile(this.allDownloads, 'ResultData',this.tableHeaders);
        }	
    }
    pageChange(event: any): void {
		this.pageCount = event * this.count;
	   if(event!=1){
		 this.pageSize = ((this.pageCount +1) - this.count);
	   }
	  else{
	   this.pageSize = 1;
      }
   
		this.getNoticesShowingDetails();
	 }
	 totalCount(pagecount,event){
        $(".ng-tns-c0-0 a").removeClass('active');
        event.target.classList.add('active');
		this.p=1;
		this.count = pagecount;
		this.pageCount = pagecount;
        this.pageSize = ((this.pageCount +1) - pagecount);
        if(this.totalItems<=20){
            this.pageCount = this.totalItems;
        }
        this.getNoticesShowingDetails();
      
     }
     onChangeYearLevel(Year: any) {
        //this.selectedYearLevel = Year;
        if(Year=="0"){
            this.allDownloads = this.fulldatas;
            this.totalItems = this.allDownloads.length;
            this.pageCount = this.count;
            this.getNoticesShowingDetails();
            return true;
        }
        else
        {
            let result:any[];
            result = this.fulldatas.filter(e => e.YYYY === parseInt(Year));
            this.allDownloads = result;
            this.totalItems = this.allDownloads.length;
            if(this.totalItems<=20){
                this.pageCount = this.totalItems;
            }
            
             this.getNoticesShowingDetails();
        }
       
     }
     uniqueValues(data, key){
        let result:any = [];
        for (var i = 0; i < data.length; i++) {
            var checkValue = data[i][key];
              var value;
                value = checkValue;
          if(value!=null){
            if (result.indexOf(value) == -1) {
                result[result.length] = value;
                if (key == "year") {
                    result.sort();
                    result.reverse();
                }
                else { 
                    //result.sort();
                 }
            }
          }
        }
        return result;
        
      }
    public getNoticesShowingDetails() {  
        if (this.locale == 'en') {
            this.noticesShowingDetails = 'Showing ' + this.pageSize + ' - '+ this.pageCount + ' of ' + this.totalItems+ ' | Display results in sets of' ;//' procurement notices matching the search criteria - ' + qterm;   
		} 
		else if (this.locale == 'es') {
            
            this.noticesShowingDetails = 'Mostrar ' + this.pageSize + ' - '+ this.pageCount + ' de ' + this.totalItems + ' | Muestre resultados en grupos de';   
        } else if (this.locale == 'fr') {
            this.noticesShowingDetails = 'Affiche ' + this.pageSize + ' - '+ this.pageCount + ' sur ' + this.totalItems+ ' | Afficher les résultats par groupe de ';
        } else if (this.locale == 'pt') {
            this.noticesShowingDetails = 'Mostrando ' + this.pageSize + ' - '+ this.pageCount + ' de ' + this.totalItems+' | Mostrar resultados em grupos de'; 
        } else if (this.locale == 'ru') {
            this.noticesShowingDetails = 'Показывает ' + this.pageSize + ' - '+ this.pageCount + ' из ' + this.totalItems+'| Показать результаты группами';
        } else if (this.locale == 'ar') {            			
			this.noticesShowingDetails = ' إظهار ' + this.pageSize + ' - ' + this.pageCount + '	خاصة بـ ' + this.totalItems+ '| عرض النتائج في مجموعات من';
        } else if (this.locale == 'zh') {
            this.noticesShowingDetails = '显示 ' + this.pageSize +' - '+ this.pageCount + ' / ' + this.totalItems+'| 按批显示结果';
        } else {	
            this.noticesShowingDetails = '';
		} 
	}
    public onSort() {
		this.reverse=!this.reverse
    }
    
    public exportAsExcelFile(json: any[], excelFileName: string, tableHeaders: any[]): void {
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
        worksheet['A1'].v = tableHeaders[0];
        worksheet['B1'].v = tableHeaders[1];
        worksheet['C1'].v = tableHeaders[2];
        if(tableHeaders[3]!=null){
            worksheet['D1'].v = tableHeaders[3];
        }
        const workbook: XLSX.WorkBook = { Sheets: { 'ResultData': worksheet }, SheetNames: ['ResultData'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        //const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
        this.saveAsExcelFile(excelBuffer, excelFileName);
      }
    
      private saveAsExcelFile(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
        });
        FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + '.xlsx');
      }

      tablehide(txt,event){
        
        
        $(".button-group a").removeClass('primary-light-blue-btn');
        event.target.classList.add('primary-light-blue-btn');
        if(txt=="Table"){
            this.buttonText = "Chart";
           $("#divtables").show();
           $("#divcharts").hide();
        }
        else if(txt=="Chart"){
            this.buttonText = "Table";
           $("#divcharts").show();
           $("#divtables").hide();
        }      
    }
}


