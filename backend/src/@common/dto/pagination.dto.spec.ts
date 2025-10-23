import { PaginationDto } from './pagination.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('PaginationDto', () => {
    it('should be defined', () => {
        const dto = new PaginationDto();
        expect(dto).toBeDefined();
    });

    it('should have default values', () => {
        const dto = new PaginationDto();
        expect(dto.page).toBeUndefined();
        expect(dto.limit).toBeUndefined();
    });

    it('should accept valid page and limit', async () => {
        const plain = {
            page: 1,
            limit: 10,
        };

        const dto = plainToInstance(PaginationDto, plain);
        const errors = await validate(dto);

        expect(dto.page).toBe(1);
        expect(dto.limit).toBe(10);
    });

    it('should transform string numbers to actual numbers', () => {
        const plain = {
            page: '2',
            limit: '20',
        };

        const dto = plainToInstance(PaginationDto, plain, {
            enableImplicitConversion: true,
        });

        expect(typeof dto.page).toBe('number');
        expect(typeof dto.limit).toBe('number');
        expect(dto.page).toBe(2);
        expect(dto.limit).toBe(20);
    });
});
