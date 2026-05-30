<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:191|unique:contacts,phone',
            'whatsapp_id' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'notes' => 'nullable|string',
            'profile_pic_url' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'is_business' => 'nullable|boolean',
            'wa_status' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'website' => 'nullable|json',
            'country' => 'nullable|string|max:4',
            'type' => 'nullable|in:individual,group',
        ];

        if ($this->input('type') === 'group') {
            $rules['phone'] = 'nullable|string|max:191';
            $rules['whatsapp_id'] = 'required|string|max:255|unique:contacts,whatsapp_id';
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'phone.unique' => 'This phone number already exists in your contacts.',
            'whatsapp_id.unique' => 'This group already exists in your contacts.',
        ];
    }
}
