<?php

namespace App\DataTables;

use App\Models\EvolutionWebhook;
use Illuminate\Database\Eloquent\Builder;
use Yajra\DataTables\EloquentDataTable;
use Yajra\DataTables\Services\DataTable;

class EvolutionWebhooksDataTable extends DataTable
{
    public function dataTable($query): EloquentDataTable
    {
        return datatables()
            ->eloquent($query)
            ->editColumn('created_at', fn (EvolutionWebhook $row) => $row->created_at?->format('Y-m-d H:i:s') ?? '—')
            ->addColumn('payload', fn (EvolutionWebhook $row) => $row->payload);
    }

    public function query(EvolutionWebhook $model): Builder
    {
        return $model->newQuery()->orderBy('id', 'desc');
    }

    public function html(): \Yajra\DataTables\Html\Builder
    {
        return $this->builder()
            ->setTableId('evolution-webhooks-table')
            ->columns([
                ['data' => 'id', 'title' => 'ID', 'orderable' => true, 'searchable' => true],
                ['data' => 'instance', 'title' => 'Instance', 'orderable' => true, 'searchable' => true],
                ['data' => 'event', 'title' => 'Event', 'orderable' => true, 'searchable' => true],
                ['data' => 'created_at', 'title' => 'Received', 'orderable' => true, 'searchable' => false],
                ['data' => 'payload', 'title' => 'Payload', 'orderable' => false, 'searchable' => false],
            ])
            ->orderBy(0, 'desc')
            ->parameters([
                'pageLength' => 25,
                'responsive' => true,
                'autoWidth' => false,
            ]);
    }

    protected function filename(): string
    {
        return 'evolution_webhooks_'.date('Ymd_His');
    }
}
