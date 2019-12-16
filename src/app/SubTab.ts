import { Component, Input } from "@angular/core";

@Component({
  selector: 'tab',
  template: `
    <ng-content *ngIf="active"></ng-content>
  `
})
export class Tab {

  @Input() title = '';
  @Input() active = true;
  @Input() disabled = false;
  @Input() index = "";

}