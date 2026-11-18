/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH0_DOMAIN: string;
  readonly VITE_AUTH0_CLIENT_ID: string;
  readonly VITE_AUTH0_AUDIENCE: string;
  readonly VITE_IDENTITY_API_URL?: string;
  readonly VITE_STORE_API_URL: string;
  readonly VITE_CATALOG_API_URL: string;
  /** `mock` (default) | `api` — fuente de cotización de carrito. */
  readonly VITE_STORE_QUOTE_SOURCE?: string;
  readonly VITE_PUBLIC_BUILDER_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
