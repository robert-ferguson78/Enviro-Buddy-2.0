declare module 'svelte/internal';
// $app/stores issue with typescript not being able to find Sveltekit internal module and types
declare module '$app/stores' {
    import { Readable } from 'svelte/store';
    export const page: Readable<{
        host: string;
        path: string;
        params: Record<string, string | string[]>;
        query: URLSearchParams;
        url: URL;
    }>;
}
// $app/navigation issue with typescript not being able to find Sveltekit internal module and types
declare module '$app/navigation' {
    export function goto(href: string, opts?: { replaceState?: boolean, noscroll?: boolean }): void;
}