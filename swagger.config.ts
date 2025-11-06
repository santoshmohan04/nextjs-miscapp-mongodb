import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Misc App API Documentation",
    version: "1.0.0",
    description:
      "API documentation for Misc App built with Next.js and MongoDB",
  },
  servers: [
    {
      url: process.env.APP_BASE_URL || "http://localhost:3000",
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "token",
        description: "JWT stored in HttpOnly cookie for authentication",
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ["./app/api/**/*.ts"], // Scan all API route files
};

export const swaggerSpec = swaggerJSDoc(options);
