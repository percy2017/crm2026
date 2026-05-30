import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export function countryFlag(code: string | null): string {
    if (!code) return '';
    return [...code.toUpperCase()].map((c) => String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0))).join('');
}
