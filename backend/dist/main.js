"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = setupSwagger;
const dotenv_1 = require("dotenv");
const app_module_1 = require("./app.module");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const nest_winston_1 = require("nest-winston");
const common_1 = require("@nestjs/common");
const payload_size_pipe_1 = require("./@common/pipes/payload-size.pipe");
const swagger_1 = require("@nestjs/swagger");
const logging_interceptor_1 = require("./@common/interceptors/logging.interceptor");
const global_exception_filter_1 = require("./@common/filters/global-exception.filter");
const transform_interceptor_1 = require("./@common/interceptors/transform.interceptor");
const security_middleware_1 = require("./@common/middleware/security.middleware");
(0, dotenv_1.config)();
const configService = new config_1.ConfigService();
const routeDocs = "/docs";
const routeDocsJson = `${routeDocs}-json`;
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const logger = app.get(nest_winston_1.WINSTON_MODULE_NEST_PROVIDER);
    app.useLogger(logger);
    const allowedOrigins = configService.get("ALLOWED_ORIGINS")?.split(',') || '*';
    app.enableCors({
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    });
    app.use(new security_middleware_1.SecurityMiddleware(configService).use.bind(new security_middleware_1.SecurityMiddleware(configService)));
    app.use(new security_middleware_1.CompressionMiddleware().use.bind(new security_middleware_1.CompressionMiddleware()));
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(), new transform_interceptor_1.TransformInterceptor());
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        disableErrorMessages: configService.get('NODE_ENV') === 'production',
        validationError: {
            target: false,
            value: false,
        },
    }), new payload_size_pipe_1.PayloadSizeValidationPipe(5 * 1024 * 1024));
    app.setGlobalPrefix('api/v1');
    await setupSwagger(app);
    const port = configService.get("BACKEND_PORT") || 3001;
    await app.listen(parseInt(port, 10));
    logger.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
    logger.log(`📚 API Documentation: http://localhost:${port}/docs`);
}
function setupSwagger(app) {
    const config = new swagger_1.DocumentBuilder()
        .setTitle("JCoder")
        .setDescription("JCoder Api")
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config, {
        deepScanRoutes: true,
    });
    swagger_1.SwaggerModule.setup("swagger", app, document);
    ScalarDocumentation(app, document);
}
function ScalarDocumentation(app, document) {
    const scalarConfig = {
        layout: "modern",
        searchHotKey: "k",
        showSidebar: true,
        theme: "bluePlanet",
        _integration: "nestjs",
        hideDownloadButton: false,
    };
    app.use(routeDocs, (_req, res) => {
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
    app.use(routeDocsJson, (_req, res) => {
        res.json(document);
    });
}
function _findMissingRefs(doc) {
    const missing = new Set();
    const components = doc.components ?? {};
    const catalogs = {
        schemas: new Set(Object.keys(components?.schemas ?? {})),
        responses: new Set(Object.keys(components?.responses ?? {})),
        parameters: new Set(Object.keys(components?.parameters ?? {})),
        requestBodies: new Set(Object.keys(components?.requestBodies ?? {})),
        headers: new Set(Object.keys(components?.headers ?? {})),
        securitySchemes: new Set(Object.keys(components?.securitySchemes ?? {})),
        links: new Set(Object.keys(components?.links ?? {})),
        callbacks: new Set(Object.keys(components?.callbacks ?? {})),
    };
    function checkRef(ref) {
        if (!ref.startsWith("#/components/"))
            return;
        const match = ref.match(/^#\/components\/([^/]+)\/(.+)$/);
        if (!match)
            return;
        const [, group, name] = match;
        const registry = catalogs[group];
        if (registry && !registry.has(name))
            missing.add(ref);
    }
    function walk(node) {
        if (!node || typeof node !== "object")
            return;
        if (Array.isArray(node))
            return node.forEach(walk);
        if (typeof node.$ref === "string")
            checkRef(node.$ref);
        for (const key of Object.keys(node))
            walk(node[key]);
    }
    walk(doc);
    const missingRefs = Array.from(missing);
}
bootstrap();
//# sourceMappingURL=main.js.map