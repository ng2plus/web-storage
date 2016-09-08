import {Observable} from 'rxjs';
import {WebStorage} from '../web-storage';

export interface StorageProvider {
	get(): WebStorage;
	validate(): Observable<WebStorage>;
}
