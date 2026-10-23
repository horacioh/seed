import {vitePreprocess} from '@sveltejs/vite-plugin-svelte'

/** Svelte compiler options shared by the harness, tests and svelte-check. */
export default {preprocess: vitePreprocess()}
