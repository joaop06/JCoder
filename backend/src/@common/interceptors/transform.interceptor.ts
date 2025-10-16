import {
    Injectable,
    CallHandler,
    NestInterceptor,
    ExecutionContext,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
    data: T;
    success: boolean;
    timestamp: string;
    path: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
        const request = context.switchToHttp().getRequest();

        return next.handle().pipe(
            map((data) => ({
                data,
                success: true,
                timestamp: new Date().toISOString(),
                path: request.url,
            })),
        );
    }
}
