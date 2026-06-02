import type { ReactNode } from 'react';

const URL_REGEX = /(https?:\/\/[^\s<]+)/g;

export function renderMessageText(text: string): ReactNode[] {
    const parts = text.split(URL_REGEX);

    return parts.map((part, i) => {
        if (part.startsWith('http://') || part.startsWith('https://')) {
            return (
                <a
                    key={i}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                >
                    {part}
                </a>
            );
        }

        return part;
    });
}
