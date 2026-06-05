import { AiAgentHeaderButton } from '@/components/ai-agent/ai-agent-header-button';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useOnlineStatus } from '@/hooks/use-online-status';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const isOnline = useOnlineStatus();

    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
                <div className="flex flex-1 items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
                <div className="flex items-center gap-3">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 cursor-default">
                                    <span className={`size-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                                    <span className={`text-xs font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                                        {isOnline ? 'Conectado' : 'Sin internet'}
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                {isOnline ? 'Conexión a internet activa' : 'No hay conexión a internet'}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <AiAgentHeaderButton />
                </div>
            </header>
        </>
    );
}
