import packageJson from "../../package.json";

/** Версия сборки — видна в админке, чтобы проверить, что деплой обновился. */
export const APP_VERSION = packageJson.version;
