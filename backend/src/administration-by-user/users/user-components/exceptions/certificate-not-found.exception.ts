import { NotFoundException } from "@nestjs/common";

export class CertificateNotFoundException extends NotFoundException {
    constructor() {
        super('Certificate is not found');
    }
};
