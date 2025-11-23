import { CallHandler, NestInterceptor, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
export interface Response<T> {
    data: T;
    success: boolean;
    timestamp: string;
    path: string;
}
export declare class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>>;
}
