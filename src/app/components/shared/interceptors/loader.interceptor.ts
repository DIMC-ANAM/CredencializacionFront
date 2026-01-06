import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { LoaderService } from '../loader.service';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {

  constructor(private loaderService: LoaderService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const skipLoader = req.headers.get('X-Skip-Loader');

    if (!skipLoader) {
      this.loaderService.show(); // muestra loader global
    }

    return next.handle(req).pipe(
      finalize(() => {
        if (!skipLoader) {
          this.loaderService.hide();
        }
      })
    );
  }
}