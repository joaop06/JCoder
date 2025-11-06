import { HttpException, HttpStatus } from '@nestjs/common';

export class MessageNotFoundException extends HttpException {
    constructor() {
        super('Mensagem não encontrada', HttpStatus.NOT_FOUND);
    }
};
