import { NextResponse } from "next/server";

type ResponseMeta = {
  statusCode?: number;
  [key: string]: unknown;
};

type ErrorPayload = {
  message: string;
  code?: string;
};

export type ApiResponse<T = unknown, M = Record<string, unknown>> = {
  success: boolean;
  data?: T;
  meta?: M;
  error?: ErrorPayload;
};

export function successResponse<T>(data: T, meta?: ResponseMeta) {
  const statusCode = meta?.statusCode ?? 200;

  const responseMeta = meta
    ? (Object.fromEntries(
        Object.entries(meta).filter(([key]) => key !== "statusCode")
      ) as Record<string, unknown>)
    : undefined;

  const payload: ApiResponse<T, Record<string, unknown>> = {
    success: true,
    data,
    ...(responseMeta && Object.keys(responseMeta).length > 0
      ? { meta: responseMeta }
      : {}),
  };

  return NextResponse.json(payload, { status: statusCode });
}

export function errorResponse(
  message: string,
  statusCode = 400,
  code?: string
) {
  const payload: ApiResponse<never, never> = {
    success: false,
    error: {
      message,
      ...(code ? { code } : {}),
    },
  };

  return NextResponse.json(payload, { status: statusCode });
}
