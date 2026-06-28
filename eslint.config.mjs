import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'dist/**',
      'build/**',
      'output/**',
      '.playwright-cli/**',
      '.codegraph/**',
      '.claude/**',
      '.cloned-sites/**',
      'cloned-sites/**',
    ],
  },
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      'react-hooks/immutability': 'warn',
      'react-hooks/refs': 'warn',
    },
  },
];

export default config;
