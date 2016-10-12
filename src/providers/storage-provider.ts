import {Observable} from 'rxjs/Observable';
import {WebStorage} from '../web-storage';

export interface StorageProvider {
	get(): WebStorage;
	validate(): Observable<WebStorage>;
}
