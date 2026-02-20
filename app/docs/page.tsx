"use client";

import { useEffect } from "react";

export default function ApiDocsPage() {
  useEffect(() => {
    // Load Swagger UI script dynamically from CDN
    const script = document.createElement("script");
    script.src = "https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js";
    script.async = true;

    script.onload = () => {
      // @ts-ignore - injected by CDN
      window.SwaggerUIBundle({
        url: "/api/docs",
        dom_id: "#swagger-container",
        presets: [
          // @ts-ignore
          window.SwaggerUIBundle.presets.apis,
        ],
        requestInterceptor: (req: any) => {
          req.credentials = "include";
          return req;
        },
      });
    };

    document.body.appendChild(script);
  }, []);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/swagger-ui-dist/swagger-ui.css"
      />

      <div
        id="swagger-container"
        style={{
          width: "100%",
          minHeight: "100vh",
          background: "white",
        }}
      />
    </>
  );
}