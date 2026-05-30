<?php

namespace App\DataTables;

use App\Models\Contact;
use Illuminate\Database\Eloquent\Builder;
use Yajra\DataTables\EloquentDataTable;
use Yajra\DataTables\Services\DataTable;

class ContactsDataTable extends DataTable
{
    public function dataTable($query): EloquentDataTable
    {
        return datatables()
            ->eloquent($query)
            ->editColumn('profile_pic_url', fn (Contact $contact) => $contact->profile_pic_url
                ? (str_starts_with($contact->profile_pic_url, 'http') || str_starts_with($contact->profile_pic_url, '/storage/')
                    ? $contact->profile_pic_url
                    : asset('storage/'.$contact->profile_pic_url))
                : null)
            ->editColumn('is_active', fn (Contact $contact) => $contact->is_active ? 'Yes' : 'No')
            ->editColumn('created_at', fn (Contact $contact) => $contact->created_at?->format('Y-m-d H:i') ?? '—')
            ->editColumn('country', fn (Contact $contact) => $contact->country
                ? sprintf(
                    '%s %s',
                    preg_replace_callback('/./', fn ($m) => mb_chr(0x1F1E6 - 0x41 + ord($m[0])), $contact->country),
                    strtoupper($contact->country),
                )
                : null)
            ->addColumn('action', function (Contact $contact) {
                return view('admin.contacts.actions', compact('contact'))->render();
            })
            ->rawColumns(['action', 'country']);
    }

    public function query(Contact $model): Builder
    {
        return $model->newQuery()
            ->when(request()->input('filters.country'), fn ($q, $v) => $q->where('country', $v))
            ->when(request()->input('filters.type'), fn ($q, $v) => $q->where('type', $v))
            ->when(request()->input('filters.is_active') !== null, fn ($q) => $q->where('is_active', request()->input('filters.is_active')))
            ->when(request()->input('filters.is_business') !== '' && request()->input('filters.is_business') !== null, fn ($q, $v) => $q->where('is_business', $v));
    }

    public function html(): \Yajra\DataTables\Html\Builder
    {
        return $this->builder()
            ->setTableId('contacts-table')
            ->columns([
                ['data' => 'id', 'title' => 'ID'],
                ['data' => 'name', 'title' => 'Name'],
                ['data' => 'phone', 'title' => 'Phone'],
                ['data' => 'email', 'title' => 'Email'],
                ['data' => 'is_active', 'title' => 'Active'],
                ['data' => 'country', 'title' => 'Country'],
                ['data' => 'created_at', 'title' => 'Created'],
                ['data' => 'action', 'title' => 'Actions', 'orderable' => false, 'searchable' => false],
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
        return 'contacts_'.date('Ymd_His');
    }
}
