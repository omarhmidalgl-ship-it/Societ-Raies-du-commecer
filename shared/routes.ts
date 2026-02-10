import { z } from "zod";
import { insertMessageSchema, messageSchema, productSchema } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  products: {
    list: {
      method: "GET" as const,
      path: "/api/products",
      responses: {
        200: z.array(productSchema),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/products/:id",
      responses: {
        200: productSchema,
        404: errorSchemas.validation,
      },
    },
  },
  messages: {
    create: {
      method: "POST" as const,
      path: "/api/messages",
      input: insertMessageSchema,
      responses: {
        201: messageSchema,
        400: errorSchemas.validation,
      },
    },
    list: {
      method: "GET" as const,
      path: "/api/messages",
      responses: {
        200: z.array(messageSchema),
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/messages/:id",
      responses: {
        200: z.object({ message: z.string() }),
        404: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
