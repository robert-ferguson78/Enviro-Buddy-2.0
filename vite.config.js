import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        sveltekit({
            experimental: {
                runes: true
            }
        })
    ],
	optimizeDeps: { 
		include: ['@sveltejs/kit'] // Include the SvelteKit package in the optimized dependencies
	},
	resolve: { 
		dedupe: ['@sveltejs/kit'] // Dedupe the SvelteKit package - prevents it from being included multiple times
	},
	server: {
		fs: {
			strict: false // Allow reading files from the file system
		}
	},
	build: {
		rollupOptions: {
			output: {
				chunkFileNames: 'assets/js/[name]-[hash].js',
				entryFileNames: 'assets/js/[name]-[hash].js',
				assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
			}
		}
	}
});