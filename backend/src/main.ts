import { join } from 'path';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { createInitialUserAdmin } from 'scripts/create-initial-user-admin';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

config();
const configService = new ConfigService();

const routeDocs = "/docs";
const routeDocsJson = `${routeDocs}-json`;


async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// Enable CORS to allow frontend requests
	app.enableCors();

	// Enable global validations of the DTOs
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
			forbidNonWhitelisted: true,
		}),
	);

	await setupSwagger(app);
	await createInitialUserAdmin();

	const port = configService.get("BACKEND_PORT");
	await app.listen(parseInt(port, 10));
}


export function setupSwagger(app: INestApplication) {
	const config = new DocumentBuilder()
		.setTitle("JCoder")
		.setDescription("JCoder Api")
		.build();

	const document = SwaggerModule.createDocument(app, config, {
		deepScanRoutes: true,
	});

	// Loga refs inválidos/ausentes no startup
	// findMissingRefs(document);

	SwaggerModule.setup("swagger", app, document);

	ScalarDocumentation(app, document);
}

function ScalarDocumentation(app: INestApplication, document: OpenAPIObject) {
	// Configurar Scalar
	const scalarConfig = {
		layout: "modern",
		searchHotKey: "k",
		showSidebar: true,
		theme: "bluePlanet",
		_integration: "nestjs",
		hideDownloadButton: false,
	};

	// Configurar Scalar em vez do Swagger UI padrão
	app.use(routeDocs, (req, res) => {
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

	// Endpoint para servir o JSON do OpenAPI
	app.use(routeDocsJson, (req, res) => {
		res.json(document);
	});
}

function findMissingRefs(doc: OpenAPIObject): void {
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
		const registry: Set<string> | undefined = (catalogs as any)[group];
		if (registry && !registry.has(name)) missing.add(ref);
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
		console.warn("[OpenAPI] Refs inválidos/ausentes detectados:", missingRefs);
	}
}

bootstrap();
