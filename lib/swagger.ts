import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Misc App API Documentation",
        version: "1.0.0",
        description:
          "API documentation for Misc App built with Next.js, Redux, and MongoDB",
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

        // 📌 Add Bookmark Schema (REQUIRED)
        schemas: {
          User: {
            type: "object",
            properties: {
              _id: { type: "string", example: "652c41f3b1a6c1b2d8e90d45" },
              name: { type: "string", example: "John Doe" },
              email: { type: "string", example: "john@example.com" },
              profilepic: {
                type: "string",
                example: "/uploads/avatar123.png",
              },
              createdAt: {
                type: "string",
                example: "2025-10-01T10:00:00Z",
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

          // ⭐ REQUIRED for Bookmarks API to show properly
          Bookmark: {
            type: "object",
            properties: {
              _id: { type: "string", example: "6730a8e8fcd88cc0951a1af1" },
              title: { type: "string", example: "Google" },
              link: {
                type: "string",
                example: "https://www.google.com",
              },
              description: {
                type: "string",
                example: "Search engine homepage",
              },
              category: { type: "string", example: "Search Engine" },
              favorite: { type: "boolean", example: false },
              thumbnail: {
                type: "string",
                example:
                  "https://api.microlink.io/?url=https://www.google.com&screenshot=true",
              },
              createdAt: {
                type: "string",
                example: "2025-11-16T08:02:47.620Z",
              },
              updatedAt: {
                type: "string",
                example: "2025-11-16T08:02:47.620Z",
              },
            },
          },
        },
      },
    },

    // Automatically scan all `route.ts` files
    apiFolder: "app/api",
  });

  return spec;
};