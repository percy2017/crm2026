import { DragDropContext, Droppable, Draggable  } from '@hello-pangea/dnd';
import type {DropResult} from '@hello-pangea/dnd';
import { DealCard } from '@/pages/admin/deals/components/deal-card';
import type { DealData, Stage } from '@/pages/admin/deals/index';

type Props = {
    pipeline: { id: number; name: string; stages: Stage[] };
    onDragEnd: (dealId: number, targetStageId: number) => void;
    onCardClick: (deal: DealData) => void;
};

export function KanbanBoard({ pipeline, onDragEnd, onCardClick }: Props) {
    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) {
return;
}

        const destStageId = Number(result.destination.droppableId);
        onDragEnd(Number(result.draggableId), destStageId);
    };

    if (!pipeline.stages?.length) {
        return (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
                No stages configured for this pipeline.
            </div>
        );
    }

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
                {pipeline.stages.map((stage) => (
                    <div key={stage.id} className="flex min-w-72 flex-1 flex-col rounded-xl border bg-muted/30">
                        <div
                            className="flex items-center justify-between border-b px-4 py-3"
                            style={stage.color ? { borderBottomColor: stage.color } : undefined}
                        >
                            <div className="flex items-center gap-2">
                                {stage.color && (
                                    <span
                                        className="size-2.5 rounded-full"
                                        style={{ backgroundColor: stage.color }}
                                    />
                                )}
                                <span className="font-semibold text-sm">{stage.name}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {stage.deals?.length ?? 0}
                            </span>
                        </div>

                        <Droppable droppableId={String(stage.id)}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`flex flex-col gap-2 p-3 min-h-[200px] transition-colors ${
                                        snapshot.isDraggingOver ? 'bg-accent/50' : ''
                                    }`}
                                >
                                    {stage.deals?.map((deal, index) => (
                                        <Draggable
                                            key={deal.id}
                                            draggableId={String(deal.id)}
                                            index={index}
                                        >
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={{
                                                        ...provided.draggableProps.style,
                                                        opacity: snapshot.isDragging ? 0.85 : 1,
                                                    }}
                                                    onClick={() => onCardClick(deal)}
                                                >
                                                    <DealCard deal={deal} />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}
            </div>
        </DragDropContext>
    );
}
