/// <reference types="astro/client" />
interface ImportMetaEnv {
  readonly TRPC_ENDPOINT_URL: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
