"use client";

import dynamic from "next/dynamic";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocsPage() {
  return (
    <div style={{ padding: "2rem" }}>
      {/* ✅ Load Swagger CSS from CDN so Turbopack doesn't choke */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/swagger-ui-dist/swagger-ui.css"
      />

      <SwaggerUI
        url="/api/docs"
        requestInterceptor={(req) => {
          req.credentials = "include";
          return req;
        }}
      />
    </div>
  );
}