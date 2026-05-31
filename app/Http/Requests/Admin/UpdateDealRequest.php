<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDealRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'stage_id' => 'sometimes|required|exists:pipeline_stages,id',
            'contact_id' => 'nullable|exists:contacts,id',
            'title' => 'sometimes|required|string|max:255',
            'value' => 'nullable|numeric|min:0',
            'assigned_to' => 'nullable|exists:users,id',
            'expected_close_date' => 'nullable|date',
            'probability' => 'nullable|integer|min:0|max:100',
            'status' => 'sometimes|in:open,won,lost',
            'lost_reason' => 'nullable|string',
            'notes' => 'nullable|string',
        ];
    }
}
