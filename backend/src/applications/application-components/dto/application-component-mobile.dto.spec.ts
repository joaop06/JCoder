import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { MobilePlatformEnum } from '../../enums/mobile-platform.enum';
import { ApplicationComponentMobileDto } from './application-component-mobile.dto';

describe('ApplicationComponentMobileDto', () => {
    let dto: ApplicationComponentMobileDto;

    beforeEach(() => {
        dto = new ApplicationComponentMobileDto();
    });

    it('should be defined', () => {
        expect(dto).toBeDefined();
    });

    describe('platform validation', () => {
        it('should accept valid iOS platform', async () => {
            const plain = {
                platform: MobilePlatformEnum.IOS,
            };

            const dto = plainToInstance(ApplicationComponentMobileDto, plain);
            const errors = await validate(dto);

            expect(dto.platform).toBe(MobilePlatformEnum.IOS);
            expect(errors.length).toBe(0);
        });

        it('should accept valid Android platform', async () => {
            const plain = {
                platform: MobilePlatformEnum.ANDROID,
            };

            const dto = plainToInstance(ApplicationComponentMobileDto, plain);
            const errors = await validate(dto);

            expect(dto.platform).toBe(MobilePlatformEnum.ANDROID);
            expect(errors.length).toBe(0);
        });

        it('should accept valid Multiplatform platform', async () => {
            const plain = {
                platform: MobilePlatformEnum.MULTIPLATFORM,
            };

            const dto = plainToInstance(ApplicationComponentMobileDto, plain);
            const errors = await validate(dto);

            expect(dto.platform).toBe(MobilePlatformEnum.MULTIPLATFORM);
            expect(errors.length).toBe(0);
        });

        it('should reject empty platform', async () => {
            const plain = {
                platform: '',
            };

            const dto = plainToInstance(ApplicationComponentMobileDto, plain);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('platform');
        });

        it('should reject null platform', async () => {
            const plain = {
                platform: null as unknown as MobilePlatformEnum,
            };

            const dto = plainToInstance(ApplicationComponentMobileDto, plain);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('platform');
        });

        it('should reject undefined platform', async () => {
            const plain = {};

            const dto = plainToInstance(ApplicationComponentMobileDto, plain);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('platform');
        });

        it('should reject invalid platform value', async () => {
            const plain = {
                platform: 'INVALID_PLATFORM',
            };

            const dto = plainToInstance(ApplicationComponentMobileDto, plain);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('platform');
        });

        it('should reject non-string platform', async () => {
            const plain = {
                platform: 123,
            };

            const dto = plainToInstance(ApplicationComponentMobileDto, plain);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('platform');
        });

        it('should accept all valid platform enum values', async () => {
            const validPlatforms = [
                MobilePlatformEnum.IOS,
                MobilePlatformEnum.ANDROID,
                MobilePlatformEnum.MULTIPLATFORM,
            ];

            for (const platform of validPlatforms) {
                const plain = { platform };
                const dto = plainToInstance(ApplicationComponentMobileDto, plain);
                const errors = await validate(dto);

                expect(errors.length).toBe(0);
                expect(dto.platform).toBe(platform);
            }
        });
    });

    describe('downloadUrl validation', () => {
        it('should accept valid optional downloadUrl', async () => {
            const plain = {
                platform: MobilePlatformEnum.ANDROID,
                downloadUrl: 'https://example.mobile.com/download/1.1.0',
            };

            const dto = plainToInstance(ApplicationComponentMobileDto, plain);
            const errors = await validate(dto);

            expect(dto.downloadUrl).toBe('https://example.mobile.com/download/1.1.0');
            expect(errors.length).toBe(0);
        });

        it('should accept undefined downloadUrl', async () => {
            const plain = {
                platform: MobilePlatformEnum.ANDROID,
            };

            const dto = plainToInstance(ApplicationComponentMobileDto, plain);
            const errors = await validate(dto);

            expect(dto.downloadUrl).toBeUndefined();
            expect(errors.length).toBe(0);
        });

        it('should reject invalid downloadUrl format', async () => {
            const plain = {
                platform: MobilePlatformEnum.ANDROID,
                downloadUrl: 'not-a-valid-url',
            };

            const dto = plainToInstance(ApplicationComponentMobileDto, plain);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('downloadUrl');
        });

        it('should accept null downloadUrl', async () => {
            const plain = {
                platform: MobilePlatformEnum.ANDROID,
                downloadUrl: null as unknown as string,
            };

            const dto = plainToInstance(ApplicationComponentMobileDto, plain);
            const errors = await validate(dto);

            expect(dto.downloadUrl).toBeNull();
            expect(errors.length).toBe(0);
        });

        it('should accept different valid downloadUrl formats', async () => {
            const validUrls = [
                'https://example.com/download/app.apk',
                'https://play.google.com/store/apps/details?id=com.example.app',
                'https://apps.apple.com/app/id123456789',
                'https://example.com/download/app.ipa',
                'https://example.com/download/app.aab',
                'https://example.com/download/1.1.0/app.apk',
                'https://example.com/download?version=1.1.0&platform=android',
            ];

            for (const url of validUrls) {
                const plain = {
                    platform: MobilePlatformEnum.ANDROID,
                    downloadUrl: url,
                };
                const dto = plainToInstance(ApplicationComponentMobileDto, plain);
                const errors = await validate(dto);

                expect(errors.length).toBe(0);
                expect(dto.downloadUrl).toBe(url);
            }
        });

        it('should reject non-string downloadUrl', async () => {
            const plain = {
                platform: MobilePlatformEnum.ANDROID,
                downloadUrl: 123,
            };

            const dto = plainToInstance(ApplicationComponentMobileDto, plain);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('downloadUrl');
        });
    });

    describe('complete validation', () => {
        it('should accept all valid fields with iOS platform', async () => {
            const plain = {
                platform: MobilePlatformEnum.IOS,
                downloadUrl: 'https://apps.apple.com/app/id123456789',
            };

            const dto = plainToInstance(ApplicationComponentMobileDto, plain);
            const errors = await validate(dto);

            expect(dto.platform).toBe(MobilePlatformEnum.IOS);
            expect(dto.downloadUrl).toBe('https://apps.apple.com/app/id123456789');
            expect(errors.length).toBe(0);
        });

        it('should accept all valid fields with Android platform', async () => {
            const plain = {
                platform: MobilePlatformEnum.ANDROID,
                downloadUrl: 'https://play.google.com/store/apps/details?id=com.example.app',
            };

            const dto = plainToInstance(ApplicationComponentMobileDto, plain);
            const errors = await validate(dto);

            expect(dto.platform).toBe(MobilePlatformEnum.ANDROID);
            expect(dto.downloadUrl).toBe('https://play.google.com/store/apps/details?id=com.example.app');
            expect(errors.length).toBe(0);
        });

        it('should accept all valid fields with Multiplatform platform', async () => {
            const plain = {
                platform: MobilePlatformEnum.MULTIPLATFORM,
                downloadUrl: 'https://example.com/download/app.apk',
            };

            const dto = plainToInstance(ApplicationComponentMobileDto, plain);
            const errors = await validate(dto);

            expect(dto.platform).toBe(MobilePlatformEnum.MULTIPLATFORM);
            expect(dto.downloadUrl).toBe('https://example.com/download/app.apk');
            expect(errors.length).toBe(0);
        });

        it('should accept only required fields', async () => {
            const plain = {
                platform: MobilePlatformEnum.ANDROID,
            };

            const dto = plainToInstance(ApplicationComponentMobileDto, plain);
            const errors = await validate(dto);

            expect(dto.platform).toBe(MobilePlatformEnum.ANDROID);
            expect(dto.downloadUrl).toBeUndefined();
            expect(errors.length).toBe(0);
        });
    });
});
