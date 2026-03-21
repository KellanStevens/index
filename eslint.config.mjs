import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginAstro from 'eslint-plugin-astro';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default [
    { ignores: ['dist/**', '.astro/**', 'bun.lockb'] },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        rules: {
            'prefer-const': 'error',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
    ...eslintPluginAstro.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
    eslintPluginPrettierRecommended,
    {
        files: ['**/*.astro', '**/*.astro/*.js', '**/*.astro/*.ts'],
        rules: {
            'astro/no-set-html-directive': 'warn',
            'astro/no-unused-css-selector': 'error',
            'astro/prefer-class-list-directive': 'warn',
            'prettier/prettier': 'off',
        },
    },
];
