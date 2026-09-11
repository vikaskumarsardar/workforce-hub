import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';

@Catch(RpcException)
export class RpcToHttpExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const error = exception.getError();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal microservice error';
    let details: any = null;

    if (typeof error === 'string') {
      message = error;
    } else if (typeof error === 'object' && error !== null) {
      const errObj = error as any;
      status = errObj.statusCode || errObj.status || HttpStatus.BAD_REQUEST;
      message = errObj.message || 'Microservice Error';
      details = errObj.details || null;
    }

    response.status(status).json({
      statusCode: status,
      message,
      details,
      timestamp: new Date().toISOString(),
    });
  }
}
