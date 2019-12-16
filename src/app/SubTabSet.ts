import {
  Component,
  Input,
  Output, 
  ContentChildren,  
  EventEmitter
} from '@angular/core';

import { Tab } from './SubTab';

@Component({
  selector: 'tabset',
  template: `
    <section class="tab-set">
      <ul
        class="nav"
        [class.nav-pills]="vertical"
        [class.nav-tabs]="!vertical">
        <li
          *ngFor="let tab of tabs"
          [class.active]="tab.active">
          <a
            (click)="tabClicked(tab)"
            class="btn"
            [class.disabled]="tab.disabled">
            <span>{{tab.title}}</span>
          </a>
        </li>
      </ul>
      <div class="projects-cont-tab">
        <ng-content></ng-content>
      </div>
    </section>
  `
})
export class Tabset {

  @Input() vertical;
  @Input() index;
  @Output() onSelect = new EventEmitter();
  @ContentChildren(Tab) tabs;

  ngAfterContentInit() {
    
  }

  ngOnChanges() {      
    if (this.tabs != undefined) {
      const tabs = this.tabs.toArray();        
      const actives = this.tabs.filter(t => { return t.active == true });
      
      if(actives.length > 1) {
        // console.error(`Multiple active tabs set 'active'`);
      } else if(!actives.length && tabs.length) {
        for (let i = 0; i < tabs.length; i++) {             
          if (tabs[i].index == this.index) {
            tabs[i].active = true;
          }        
        }     
      }
    }    
  }

  tabClicked(tab) {
    const tabs = this.tabs.toArray();
    tabs.forEach(tab => tab.active = false);
    tab.active = true;    
    this.onSelect.emit(tab);
  }
}

export const TAB_COMPONENTS = [
  Tabset,
  Tab
];