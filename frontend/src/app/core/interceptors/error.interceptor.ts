
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private toastr: ToastrService, private router: Router) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                let errorMessage = 'An error occurred';

                if (error.error instanceof ErrorEvent) {
                    // Client-side error
                    errorMessage = error.error.message;
                } else {
                    // Server-side error
                    errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;

                    if (error.status === 403) {
                        this.toastr.error('You do not have permission to perform this action');
                    } else if (error.status === 404) {
                        this.toastr.error('Resource not found');
                    } else if (error.status === 500) {
                        this.toastr.error('Server error. Please try again later');
                    } else {
                        this.toastr.error(errorMessage);
                    }
                }

                return throwError(() => error);
            })
        );
    }
}