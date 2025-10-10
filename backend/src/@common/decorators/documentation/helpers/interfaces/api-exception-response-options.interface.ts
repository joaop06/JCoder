export interface ApiExceptionResponseOptions {
    // Example message to be displayed; if omitted, attempts to infer from the default description
    exampleMessage?: string;
    // Description of the response in Swagger; if omitted, uses the default status description
    description?: string;
    // Example of the “error” field (usually the short reason, e.g., “Bad Request”)
    exampleError?: string;
    // Example of statusCode; useful when you want to force a specific code (e.g., 422)
    exampleStatusCode?: number;
    // Example name to appear in the Swagger UI
    exampleName?: string;
};
