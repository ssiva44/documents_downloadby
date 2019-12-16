import { Injectable } from '@angular/core';  
import { Http, Response } from '@angular/http';
import { map } from 'rxjs/operators';

@Injectable()
export class DataService {  	
	constructor(public http: Http) { }
	
	getResponse(url: string) {	
		return this.http.get(url).pipe(map((response: Response) => {		
			if(response){
				if (response.status === 200) {
					return response.json();
				}
			}				
		}));					
	}	
} 	