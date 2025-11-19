# TypeORM Migrations Guide

This document explains how to use the migration scripts configured in the project.

## Available Scripts

### 1. Generate Migration Automatically
Generates a new migration based on changes in entities:

```bash
npm run migration:generate src/@common/database/migrations/NomeDaMigration
```

**Example:**
```bash
npm run migration:generate src/@common/database/migrations/AddConversationTable
```

### 2. Create Manual Migration
Creates an empty migration file to write SQL manually:

```bash
npm run migration:create src/@common/database/migrations/NomeDaMigration
```

**Example:**
```bash
npm run migration:create src/@common/database/migrations/CustomDataMigration
```

### 3. Run Migrations
Executes all pending migrations:

```bash
npm run migration:run
```

### 4. Revert Last Migration
Reverts the last executed migration:

```bash
npm run migration:revert
```

### 5. Show Migration Status
Shows which migrations have been executed and which are pending:

```bash
npm run migration:show
```

## Recommended Workflow

1. **Make changes to entities** (add fields, relations, etc.)

2. **Generate the migration automatically:**
   ```bash
   npm run migration:generate src/@common/database/migrations/DescricaoDaMudanca
   ```

3. **Review the generated file** in `src/@common/database/migrations/` to ensure it's correct

4. **Run the migration:**
   ```bash
   npm run migration:run
   ```

5. **If necessary, revert:**
   ```bash
   npm run migration:revert
   ```

## Important

- ⚠️ **Always review** generated migrations before executing them in production
- ⚠️ **Backup** the database before running migrations in production
- ⚠️ Migrations are executed in chronological order (based on the timestamp in the filename)
- ⚠️ Do not edit migrations that have already been executed in production. Create a new migration to fix issues

## Configuration

Migrations are configured in the `src/@common/database/data-source.ts` file and use the same environment variables as the project:

- `BACKEND_DATABASE_HOST`
- `BACKEND_DATABASE_PORT`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `DATABASE_NAME`

