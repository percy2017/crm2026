import { useState, useCallback } from 'react';

type ConfirmConfig = {
    title: string;
    description: string;
    onConfirm: () => void;
};

export function useConfirmDialog() {
    const [config, setConfig] = useState<ConfirmConfig | null>(null);

    const confirm = useCallback((action: () => void, title = 'Confirm', description = 'Are you sure?') => {
        setConfig({ onConfirm: action, title, description });
    }, []);

    const dialogProps = {
        open: config !== null,
        onOpenChange: (open: boolean) => {
 if (!open) {
setConfig(null);
} 
},
        title: config?.title ?? '',
        description: config?.description ?? '',
        onConfirm: () => {
 config?.onConfirm(); setConfig(null); 
},
    };

    return { confirm, dialogProps };
}
