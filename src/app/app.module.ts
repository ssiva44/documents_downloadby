import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { NgModule } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { Tab } from './SubTab';
import { Tabset } from './SubTabSet';
import { AppComponent } from './app.component';
import { DownloadComponent } from './download.component';
import { OrderModule } from 'ngx-order-pipe';
import {TabsModule} from 'ngx-tabset';

@NgModule({
  declarations: [
    AppComponent,
    Tab,
    Tabset,
    DownloadComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    NgxPaginationModule,
    OrderModule  ,
    TabsModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
