<?php

namespace App\DataTables;

use Illuminate\Database\Eloquent\Builder;
use Spatie\Permission\Models\Role;
use Yajra\DataTables\EloquentDataTable;
use Yajra\DataTables\Services\DataTable;

class RolesDataTable extends DataTable
{
    public function dataTable($query): EloquentDataTable
    {
        return datatables()
            ->eloquent($query)
            ->addColumn('permissions', fn (Role $role) => $role->permissions->pluck('name')->implode(', ') ?: '—')
            ->editColumn('created_at', fn (Role $role) => $role->created_at?->format('Y-m-d H:i'))
            ->addColumn('action', fn (Role $role) => view('admin.roles.actions', compact('role'))->render())
            ->rawColumns(['action']);
    }

    public function query(Role $model): Builder
    {
        return $model->newQuery()
            ->with('permissions')
            ->select('roles.*')
            ->selectSub(
                'select count(*) from model_has_roles where model_has_roles.role_id = roles.id',
                'users_count',
            );
    }

    public function html(): \Yajra\DataTables\Html\Builder
    {
        return $this->builder()
            ->setTableId('roles-table')
            ->columns([
                ['data' => 'id', 'title' => 'ID'],
                ['data' => 'name', 'title' => 'Name'],
                ['data' => 'permissions', 'title' => 'Permissions'],
                ['data' => 'users_count', 'title' => 'Users', 'searchable' => false],
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
        return 'roles_'.date('Ymd_His');
    }
}
