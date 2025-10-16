import { config } from 'dotenv';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { createInitialUserAdmin } from 'scripts/create-initial-user-admin';
import { PayloadSizeValidationPipe } from './@common/pipes/payload-size.pipe';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { LoggingInterceptor } from './@common/interceptors/logging.interceptor';
import { GlobalExceptionFilter } from './@common/filters/global-exception.filter';
import { TransformInterceptor } from './@common/interceptors/transform.interceptor';
import { SecurityMiddleware, CompressionMiddleware } from './@common/middleware/security.middleware';

config();
const configService = new ConfigService();

const routeDocs = "/docs";
const routeDocsJson = `${routeDocs}-json`;


async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
	app.useLogger(logger);

	// Configure CORS with specific origins
	const allowedOrigins = configService.get("ALLOWED_ORIGINS")?.split(',') || ['http://localhost:3000'];
	app.enableCors({
		origin: allowedOrigins,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
		allowedHeaders: ['Content-Type', 'Authorization'],
		credentials: true,
	});

	// Apply security middleware
	app.use(new SecurityMiddleware().use.bind(new SecurityMiddleware()));
	app.use(new CompressionMiddleware().use.bind(new CompressionMiddleware()));

	// Global interceptors
	app.useGlobalInterceptors(
		new LoggingInterceptor(),
		new TransformInterceptor(),
	);

	// Global exception filter
	app.useGlobalFilters(new GlobalExceptionFilter());

	// Enable global validations of the DTOs with enhanced security
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
			forbidNonWhitelisted: true,
			disableErrorMessages: configService.get('NODE_ENV') === 'production',
			validationError: {
				target: false,
				value: false,
			},
		}),
		new PayloadSizeValidationPipe(5 * 1024 * 1024), // 5MB limit
	);

	// Set global prefix
	app.setGlobalPrefix('api/v1');

	await setupSwagger(app);
	await createInitialUserAdmin();

	const port = configService.get("BACKEND_PORT") || 3001;
	await app.listen(parseInt(port, 10));

	logger.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
	logger.log(`📚 API Documentation: http://localhost:${port}/docs`);
}


export function setupSwagger(app: INestApplication) {
	const config = new DocumentBuilder()
		.setTitle("JCoder")
		.setDescription("JCoder Api")
		.build();

	const document = SwaggerModule.createDocument(app, config, {
		deepScanRoutes: true,
	});

	// Log invalid/missing refs on startup
	// findMissingRefs(document);

	SwaggerModule.setup("swagger", app, document);

	ScalarDocumentation(app, document);
}

function ScalarDocumentation(app: INestApplication, document: OpenAPIObject) {
	// Configure Scalar
	const scalarConfig = {
		layout: "modern",
		searchHotKey: "k",
		showSidebar: true,
		theme: "bluePlanet",
		_integration: "nestjs",
		hideDownloadButton: false,
	};

	// Configure Scalar instead of the default Swagger UI
	app.use(routeDocs, (_req: any, res: any) => {
		const html = `
			<!doctype html>
			<html>
			<head>
				<meta charset="utf-8" />
				<title>JCoder - API</title>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<style>
				body { margin: 0; padding: 0; }
				</style>
			</head>
			<body>
				<script
					id="api-reference"
					data-url="${routeDocsJson}"
					data-configuration='${JSON.stringify(scalarConfig)}'
				>
				</script>
				<script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.34.4"></script>
				<script>
					(function () {
						if (!(window.crypto && window.crypto.subtle)) {
							window.crypto = window.crypto || {};
							window.crypto.subtle = {
								digest: async function (algorithm, data) {
									let h = 0, arr = new Uint8Array(data);
									for (let i = 0; i < arr.length; i++) h = (h * 31 + arr[i]) | 0;

									const buf = new Uint8Array(4);
									new DataView(buf.buffer).setInt32(0, h);
									return buf.buffer;
								}
							};
						}
					})();
				</script>
			</body>
			</html>
    	`;
		res.send(html);
	});

	// Endpoint to serve the OpenAPI JSON
	app.use(routeDocsJson, (_req: any, res: any) => {
		res.json(document);
	});
}

function _findMissingRefs(doc: OpenAPIObject): void {
	const missing = new Set<string>();
	const components = doc.components ?? ({} as OpenAPIObject["components"]);

	const catalogs: Record<string, Set<string>> = {
		schemas: new Set(Object.keys(components?.schemas ?? {})),
		responses: new Set(Object.keys(components?.responses ?? {})),
		parameters: new Set(Object.keys(components?.parameters ?? {})),
		requestBodies: new Set(Object.keys(components?.requestBodies ?? {})),
		headers: new Set(Object.keys(components?.headers ?? {})),
		securitySchemes: new Set(Object.keys(components?.securitySchemes ?? {})),
		links: new Set(Object.keys((components as any)?.links ?? {})),
		callbacks: new Set(Object.keys((components as any)?.callbacks ?? {})),
	};

	function checkRef(ref: string) {
		if (!ref.startsWith("#/components/")) return;
		const match = ref.match(/^#\/components\/([^/]+)\/(.+)$/);
		if (!match) return;
		const [, group, name] = match;
		const registry: Set<string> | undefined = (catalogs as any)[group!];
		if (registry && !registry.has(name!)) missing.add(ref);
	}

	function walk(node: any) {
		if (!node || typeof node !== "object") return;
		if (Array.isArray(node)) return node.forEach(walk);
		if (typeof (node as any).$ref === "string") checkRef((node as any).$ref);
		for (const key of Object.keys(node)) walk((node as any)[key]);
	}

	walk(doc as any);
	const missingRefs = Array.from(missing);

	if (missingRefs.length) {
		// eslint-disable-next-line no-console
		console.warn("[OpenAPI] Invalid/missing refs detected:", missingRefs);
	}
}

bootstrap();
