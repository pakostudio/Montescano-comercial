import tseslint from 'typescript-eslint';
export default tseslint.config({ignores:['.next/**','node_modules/**','.audit/**','.vercel/**','next-env.d.ts','scripts/**']},...tseslint.configs.recommended);
