/** @type {import('@lingui/conf').LinguiConfig} */
module.exports = {
  locales: ['en', 'zh-HK'],
  sourceLocale: 'en',
  catalogs: [
    {
      path: '<rootDir>/locales/{locale}/messages',
      include: ['app', 'components', 'hooks', 'store', 'constants'],
      exclude: ['**/node_modules/**'],
    },
  ],
  format: 'po',
  formatOptions: {
    origins: false,
    lineNumbers: false,
  },
  orderBy: 'messageId',
  pseudoLocale: 'pseudo',
  fallbackLocales: {
    default: 'en',
    'zh-HK': 'en',
  },
  runtimeConfigModule: {
    i18n: ['@lingui/core', 'i18n'],
  },
};
