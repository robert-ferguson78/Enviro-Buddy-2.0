import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
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
	}
});
