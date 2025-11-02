import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    definition: {
      openapi: "3.0.0", // ✅ required at root
      info: {
        title: "Misc App API Documentation",
        version: "1.0.0",
        description:
          "API documentation for Misc App built with Next.js, Redux, and MongoDB",
      },
      servers: [
        {
          url: process.env.APP_BASE_URL || "http://localhost:3000",
          description: "Local server",
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
        schemas: {
          User: {
            type: "object",
            properties: {
              _id: {
                type: "string",
                example: "652c41f3b1a6c1b2d8e90d45",
              },
              name: { type: "string", example: "John Doe" },
              email: { type: "string", example: "john@example.com" },
              profilepic: {
                type: "string",
                example: "/uploads/avatar123.png",
              },
              updatedAt: {
                type: "string",
                example: "2025-11-01T12:00:00Z",
              },
            },
          },
          Recipe: {
            type: "object",
            properties: {
              _id: { type: "string", example: "6725c7f1287acbff4e9b3d21" },
              name: { type: "string", example: "Masala Dosa" },
              description: {
                type: "string",
                example: "A South Indian rice crepe with spicy potato filling.",
              },
              imagePath: {
                type: "string",
                example: "https://source.unsplash.com/400x300/?indian,food",
              },
              ingredients: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "Rice" },
                    amount: { type: "number", example: 2 },
                  },
                },
              },
              createdBy: {
                type: "string",
                example: "671fe78141e36f10fca01e59",
              },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
        },
      },
    },
    apiFolder: "app/api", // ✅ automatically scans all route.ts
  });

  return spec;
};
