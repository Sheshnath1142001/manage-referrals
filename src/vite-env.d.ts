
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EXTERNAL_API_URL: string;
  readonly API_BASE_URL: string;
  readonly VERSION_NO: string;
  readonly BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
