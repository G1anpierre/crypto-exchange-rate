import nextConfig from 'eslint-config-next'

const eslintConfig = [
  ...nextConfig,
  {
    ignores: [
      'playwright-report/**',
      '.next/**',
      'node_modules/**',
      'out/**',
      'build/**',
    ],
  },
]

export default eslintConfig
