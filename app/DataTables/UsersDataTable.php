<?php

namespace App\DataTables;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Yajra\DataTables\EloquentDataTable;
use Yajra\DataTables\Services\DataTable;

class UsersDataTable extends DataTable
{
    public function dataTable($query): EloquentDataTable
    {
        return datatables()
            ->eloquent($query)
            ->addColumn('action', function (User $user) {
                return view('admin.users.actions', compact('user'))->render();
            })
            ->editColumn('is_admin', fn (User $user) => $user->is_admin ? 'Yes' : 'No')
            ->editColumn('created_at', fn (User $user) => $user->created_at?->format('Y-m-d H:i'))
            ->editColumn('email_verified_at', fn (User $user) => $user->email_verified_at?->format('Y-m-d H:i') ?? '—')
            ->rawColumns(['action']);
    }

    public function query(User $model): Builder
    {
        return $model->newQuery();
    }

    public function html(): \Yajra\DataTables\Html\Builder
    {
        return $this->builder()
            ->setTableId('users-table')
            ->columns([
                ['data' => 'id', 'title' => 'ID'],
                ['data' => 'name', 'title' => 'Name'],
                ['data' => 'email', 'title' => 'Email'],
                ['data' => 'is_admin', 'title' => 'Admin'],
                ['data' => 'email_verified_at', 'title' => 'Verified'],
                ['data' => 'created_at', 'title' => 'Created'],
                ['data' => 'action', 'title' => 'Actions', 'orderable' => false, 'searchable' => false],
            ])
            ->orderBy(0, 'asc')
            ->parameters([
                'pageLength' => 25,
                'responsive' => true,
                'autoWidth' => false,
                'buttons' => ['create', 'export', 'print', 'reset', 'reload'],
            ]);
    }

    protected function filename(): string
    {
        return 'users_'.date('Ymd_His');
    }
}
