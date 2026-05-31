<?php

namespace App\DataTables;

use App\Models\Deal;
use Illuminate\Database\Eloquent\Builder;
use Yajra\DataTables\EloquentDataTable;
use Yajra\DataTables\Services\DataTable;

class DealsDataTable extends DataTable
{
    public function dataTable($query): EloquentDataTable
    {
        return datatables()
            ->eloquent($query)
            ->addColumn('contact_name', fn (Deal $deal) => $deal->contact?->name ?? '—')
            ->addColumn('assigned_name', fn (Deal $deal) => $deal->assignedUser?->name ?? '—')
            ->addColumn('stage_name', fn (Deal $deal) => $deal->stage?->name ?? '—')
            ->editColumn('value', fn (Deal $deal) => number_format((float) $deal->value, 2))
            ->editColumn('created_at', fn (Deal $deal) => $deal->created_at?->format('Y-m-d H:i'))
            ->addColumn('action', fn (Deal $deal) => view('admin.deals.actions', compact('deal'))->render())
            ->rawColumns(['action']);
    }

    public function query(Deal $model): Builder
    {
        return $model->newQuery()
            ->with(['contact', 'assignedUser', 'stage']);
    }

    public function html(): \Yajra\DataTables\Html\Builder
    {
        return $this->builder()
            ->setTableId('deals-table')
            ->columns([
                ['data' => 'id', 'title' => 'ID'],
                ['data' => 'title', 'title' => 'Title'],
                ['data' => 'stage_name', 'title' => 'Stage', 'orderable' => false, 'searchable' => false],
                ['data' => 'value', 'title' => 'Value'],
                ['data' => 'contact_name', 'title' => 'Contact', 'orderable' => false],
                ['data' => 'assigned_name', 'title' => 'Assigned', 'orderable' => false],
                ['data' => 'status', 'title' => 'Status'],
                ['data' => 'created_at', 'title' => 'Created'],
                ['data' => 'action', 'title' => 'Actions', 'orderable' => false, 'searchable' => false],
            ])
            ->orderBy(0, 'asc')
            ->parameters([
                'pageLength' => 25,
                'responsive' => true,
                'autoWidth' => false,
            ]);
    }

    protected function filename(): string
    {
        return 'deals_'.date('Ymd_His');
    }
}
