import { Pipe, PipeTransform } from '@angular/core';
import {WebStorageService} from './web-storage.service';

@Pipe({name: 'webStorage', pure: false})
/** Transform to Title Case: uppercase the first letter of the words in a string.*/
export class WebStoragePipe implements PipeTransform {
  constructor(public ws: WebStorageService) {}

  transform(input: string, defaultValue?): any {
    return this.ws.get(input, defaultValue);
  }
}