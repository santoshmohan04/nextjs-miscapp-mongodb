"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocsPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <SwaggerUI
        url="/api/docs"
        requestInterceptor={(req) => {
          req.credentials = "include"; // ✅ Include cookies automatically
          return req;
        }}
      />
    </div>
  );
}
