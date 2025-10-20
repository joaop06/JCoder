# Unit Tests for Application Component DTOs

This directory contains comprehensive unit tests for all application component DTOs.

## Test Files

### 1. `application-component-api.dto.spec.ts`
Tests the DTO for API components with validations for:
- **domain**: Required field, must be a non-empty string
- **apiUrl**: Required field, must be a valid URL
- **documentationUrl**: Optional field, must be a valid URL when provided
- **healthCheckEndpoint**: Optional field, must be a valid URL when provided

**Total tests**: 18 tests

### 2. `application-component-frontend.dto.spec.ts`
Tests the DTO for Frontend components with validations for:
- **frontendUrl**: Required field, must be a valid URL
- **screenshotUrl**: Optional field, must be a valid URL when provided

**Total tests**: 14 tests

### 3. `application-component-library.dto.spec.ts`
Tests the DTO for Library components with validations for:
- **packageManagerUrl**: Required field, must be a valid URL
- **readmeContent**: Optional field, must be a string when provided

**Total tests**: 15 tests

### 4. `application-component-mobile.dto.spec.ts`
Tests the DTO for Mobile components with validations for:
- **platform**: Required field, must be a valid value from `MobilePlatformEnum`
- **downloadUrl**: Optional field, must be a valid URL when provided

**Total tests**: 20 tests

### 5. `create-components-for-type.dto.spec.ts`
Tests the structure and basic validations of complex DTOs:
- Validation of `ApplicationTypeEnum` values
- Documentation of field requirements
- Structure of supported components

**Total tests**: 13 tests

## Test Coverage

### Tested Scenarios
- ✅ Required field validation
- ✅ Optional field validation
- ✅ URL format validation
- ✅ Enum validation
- ✅ Data type validation
- ✅ Null and undefined value validation
- ✅ Empty string validation
- ✅ Different valid URL format validation
- ✅ Special content validation (special characters, long content)

### Total Tests
**86 tests** covering all application component DTOs.

## Running Tests

To run all DTO tests:

```bash
npm test -- --testPathPatterns="application-components/dto"
```

To run a specific test:

```bash
npm test -- --testPathPatterns="application-component-api.dto.spec.ts"
```

## Test Structure

Each test file follows the pattern:

1. **Setup**: Initial configuration and instance creation
2. **Required Field Validation**: Tests for fields that cannot be null/empty
3. **Optional Field Validation**: Tests for fields that can be null/undefined
4. **Format Validation**: Tests for URL and other format validation
5. **Complete Validation**: Tests with all fields filled
6. **Error Scenarios**: Tests for cases that should fail

## Dependencies

The tests use:
- `class-validator` for validation
- `class-transformer` for data transformation
- `jest` as the testing framework
- Enums and types defined in the project

## Important Notes

- The `CreateComponentsForTypeDto` test was simplified due to circular dependencies between entities
- All tests are unit tests and do not depend on databases or external services
- Tests cover both success and failure cases
- URL validation includes different valid formats (HTTP, HTTPS, with ports, paths, etc.)
