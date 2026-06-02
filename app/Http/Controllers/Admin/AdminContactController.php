<?php

namespace App\Http\Controllers\Admin;

use App\DataTables\ContactsDataTable;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreContactRequest;
use App\Http\Requests\Admin\UpdateContactRequest;
use App\Models\Contact;
use App\Models\Conversation;
use App\Models\Message;
use App\Services\EvolutionApiService;
use App\Services\ImageProxyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AdminContactController extends Controller
{
    public function index(ContactsDataTable $dataTable): Response|JsonResponse
    {
        if ($dataTable->request()->ajax() && $dataTable->request()->wantsJson()) {
            return $dataTable->ajax();
        }

        $countries = Contact::whereNotNull('country')
            ->distinct()
            ->orderBy('country')
            ->pluck('country');

        return Inertia::render('admin/contacts/index', [
            'countries' => $countries,
        ]);
    }

    public function show(Contact $contact): JsonResponse
    {
        if ($contact->type === 'individual') {
            $groups = $contact->groupContacts()->get(['id', 'name']);
        } else {
            $members = $contact->members()->get(['id', 'name', 'phone']);
        }

        $phone = $contact->phone;
        $chatsCount = 0;
        $messagesCount = 0;
        $lastMessageAt = null;

        if ($phone) {
            $chatsQuery = Conversation::where('contact_id', $contact->id);
            $chatsCount = $chatsQuery->count();

            $channelIds = $chatsQuery->pluck('channel_id');

            if ($channelIds->isNotEmpty()) {
                $messagesCount = Message::whereIn('channel_id', $channelIds)->count();
                $lastMessageAt = Message::whereIn('channel_id', $channelIds)
                    ->latest('created_at')
                    ->value('created_at');
            }
        }

        $data = $contact->toArray();

        $data['profile_pic_url'] = $contact->profile_pic_url
            ? (str_starts_with($contact->profile_pic_url, 'http') || str_starts_with($contact->profile_pic_url, '/storage/')
                ? $contact->profile_pic_url
                : asset('storage/'.$contact->profile_pic_url))
            : null;

        $data['is_business'] = (bool) ($data['is_business'] ?? false);

        return response()->json([
            ...$data,
            'groups' => $groups ?? [],
            'members' => $members ?? [],
            'chats_count' => $chatsCount,
            'messages_count' => $messagesCount,
            'last_message_at' => $lastMessageAt,
        ]);
    }

    public function create(EvolutionApiService $evolution): Response
    {
        $instances = [];

        try {
            $instances = $evolution->fetchInstances();
        } catch (\Exception $e) {
            report($e);
        }

        $instanceNames = array_map(fn ($i) => $i['name'], $instances);

        $countries = Contact::whereNotNull('country')
            ->distinct()
            ->orderBy('country')
            ->pluck('country');

        return Inertia::render('admin/contacts/create', [
            'instances' => $instanceNames,
            'countries' => $countries,
        ]);
    }

    public function import(EvolutionApiService $evolution): Response
    {
        $instances = [];

        try {
            $allInstances = $evolution->fetchInstances();
            $instances = array_map(fn ($i) => $i['name'], $allInstances);
        } catch (\Exception $e) {
            report($e);
        }

        $countries = Contact::whereNotNull('country')
            ->distinct()
            ->orderBy('country')
            ->pluck('country');

        return Inertia::render('admin/contacts/import', [
            'instances' => $instances,
            'countries' => $countries,
        ]);
    }

    public function importCsv(Request $request): JsonResponse
    {
        $rows = $request->validate([
            'rows' => 'required|array',
            'rows.*.phone' => 'required|string|max:191',
            'rows.*.name' => 'nullable|string|max:255',
            'rows.*.email' => 'nullable|email|max:255',
            'rows.*.country' => 'nullable|string|max:4',
            'rows.*.notes' => 'nullable|string',
        ])['rows'];

        $imported = 0;
        $skipped = 0;
        $errors = [];

        foreach ($rows as $row) {
            $phone = $row['phone'];

            if (Contact::where('phone', $phone)->exists()) {
                $skipped++;

                continue;
            }

            try {
                Contact::create([
                    'name' => $row['name'] ?? null,
                    'phone' => $phone,
                    'email' => $row['email'] ?? null,
                    'country' => $row['country'] ?? null,
                    'notes' => $row['notes'] ?? null,
                    'type' => 'individual',
                    'is_active' => true,
                ]);

                $imported++;
            } catch (\Exception $e) {
                $errors[] = "Phone {$phone}: {$e->getMessage()}";
            }
        }

        return response()->json([
            'imported' => $imported,
            'skipped' => $skipped,
            'errors' => $errors,
        ]);
    }

    public function store(StoreContactRequest $request, ImageProxyService $imageProxy): RedirectResponse
    {
        $data = $request->validated();

        $data['is_active'] = $request->boolean('is_active', true);
        $data['is_business'] = $request->boolean('is_business', false);

        if (! empty($data['profile_pic_url']) && str_starts_with($data['profile_pic_url'], 'http')) {
            $localPath = $imageProxy->download($data['profile_pic_url']);
            if ($localPath) {
                $data['profile_pic_url'] = $localPath;
            }
        }

        Contact::create($data);

        return redirect()->route('admin.contacts.index')
            ->with('success', 'Contact created successfully.');
    }

    public function fetchFromEvolution(Request $request, EvolutionApiService $evolution, ImageProxyService $imageProxy): JsonResponse
    {
        $request->validate([
            'number' => 'required|string',
        ]);

        $number = $request->input('number');

        try {
            $instances = $evolution->fetchInstances();
            $instanceNames = array_map(fn ($i) => $i['name'], $instances);

            $verified = false;

            foreach ($instanceNames as $instance) {
                try {
                    $check = $evolution->whatsappNumbers($instance, $number);
                    if (! empty($check) && isset($check[0]['exists']) && $check[0]['exists']) {
                        $verified = true;
                        break;
                    }
                } catch (\Exception $e) {
                    report($e);
                }
            }

            if (! $verified) {
                return response()->json([
                    'numberExists' => false,
                    'verified' => false,
                ]);
            }

            $best = [
                'name' => null,
                'wuid' => null,
                'profilePicUrl' => null,
                'isBusiness' => false,
                'status' => null,
                'description' => null,
                'website' => null,
                'numberExists' => true,
            ];

            foreach ($instanceNames as $instance) {
                try {
                    $profile = $evolution->fetchProfile($instance, $number);

                    if (empty($best['name']) && ! empty($profile['name'])) {
                        $best['name'] = $profile['name'];
                    }
                    if (empty($best['wuid']) && ! empty($profile['wuid'])) {
                        $best['wuid'] = $profile['wuid'];
                    }
                    if (empty($best['status']) && ! empty($profile['status']['status'])) {
                        $best['status'] = $profile['status']['status'];
                    }
                    if (! empty($profile['isBusiness'])) {
                        $best['isBusiness'] = true;
                    }
                    if (empty($best['profilePicUrl']) && ! empty($profile['picture'])) {
                        $best['profilePicUrl'] = $profile['picture'];
                    }
                } catch (\Exception $e) {
                    report($e);
                }

                try {
                    $pic = $evolution->fetchProfilePictureUrl($instance, $number);
                    if (empty($best['profilePicUrl']) && ! empty($pic['profilePictureUrl'])) {
                        $best['profilePicUrl'] = $pic['profilePictureUrl'];
                    }
                } catch (\Exception $e) {
                    report($e);
                }

                try {
                    $biz = $evolution->fetchBusinessProfile($instance, $number);
                    if (empty($best['description']) && ! empty($biz['description'])) {
                        $best['description'] = $biz['description'];
                    }
                    if (empty($best['website']) && ! empty($biz['website'])) {
                        $best['website'] = $biz['website'];
                    }
                    if (! empty($biz['isBusiness'])) {
                        $best['isBusiness'] = true;
                    }
                } catch (\Exception $e) {
                    report($e);
                }
            }

            if ($best['name'] !== null && preg_match('/^\d+$/', $best['name'])) {
                $best['name'] = null;
            }

            $localPic = null;
            if ($best['profilePicUrl']) {
                $localPic = $imageProxy->download($best['profilePicUrl']);
            }

            $country = Contact::detectCountry($number);

            $existing = Contact::where('phone', $number)->first(['id', 'name', 'phone']);

            return response()->json([
                'name' => $best['name'] ?: null,
                'phone' => $number,
                'whatsapp_id' => $best['wuid'] ?: null,
                'profile_pic_url' => $localPic,
                'country' => $country,
                'is_business' => $best['isBusiness'],
                'wa_status' => $best['status'],
                'description' => $best['description'],
                'website' => $best['website'],
                'numberExists' => true,
                'verified' => true,
                'already_exists' => $existing !== null,
                'existing_contact' => $existing,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function scanInstances(Request $request, EvolutionApiService $evolution): JsonResponse
    {
        set_time_limit(0);

        $request->validate([
            'instances' => 'required|array',
            'instances.*' => 'string',
        ]);

        $instanceNames = $request->input('instances');
        $contacts = [];
        $errors = [];

        foreach ($instanceNames as $instance) {
            try {
                $raw = $evolution->findContacts($instance);

                foreach ($raw as $c) {
                    if (($c['type'] ?? null) !== 'contact') {
                        continue;
                    }

                    $remoteJid = $c['remoteJid'] ?? '';
                    if (! str_ends_with($remoteJid, '@s.whatsapp.net')) {
                        continue;
                    }

                    $phone = str_replace('@s.whatsapp.net', '', $remoteJid);
                    $whatsappId = $remoteJid;
                    $name = $c['pushName'] ?? null;

                    if (empty($name) && empty($phone)) {
                        continue;
                    }

                    if (Contact::where('whatsapp_id', $whatsappId)->exists() ||
                        Contact::where('phone', $phone)->exists()) {
                        continue;
                    }

                    $contacts[] = [
                        'name' => $name,
                        'phone' => $phone,
                        'whatsapp_id' => $whatsappId,
                        'profile_pic_url' => $c['profilePicUrl'] ?? null,
                    ];
                }
            } catch (\Exception $e) {
                report($e);
                $errors[] = "Instance $instance: ".$e->getMessage();
            }
        }

        return response()->json([
            'contacts' => $contacts,
            'total' => count($contacts),
            'errors' => $errors,
        ]);
    }

    public function importBatch(Request $request, EvolutionApiService $evolution, ImageProxyService $imageProxy): JsonResponse
    {
        set_time_limit(0);

        $request->validate([
            'contacts' => 'required|array',
            'contacts.*.name' => 'nullable|string',
            'contacts.*.phone' => 'required|string',
            'contacts.*.whatsapp_id' => 'nullable|string',
            'contacts.*.profile_pic_url' => 'nullable|string',
            'instances' => 'required|array',
            'instances.*' => 'string',
        ]);

        $batch = $request->input('contacts');
        $instanceNames = $request->input('instances');
        $imported = 0;
        $errors = [];

        foreach ($batch as $c) {
            try {
                $phone = $c['phone'];
                $best = [
                    'name' => $c['name'] ?? null,
                    'wuid' => $c['whatsapp_id'] ?? null,
                    'profilePicUrl' => $c['profile_pic_url'] ?? null,
                    'isBusiness' => false,
                    'status' => null,
                    'description' => null,
                    'website' => null,
                ];

                foreach ($instanceNames as $instance) {
                    try {
                        $profile = $evolution->fetchProfile($instance, $phone);

                        if (empty($best['name']) && ! empty($profile['name'])) {
                            $best['name'] = $profile['name'];
                        }
                        if (empty($best['wuid']) && ! empty($profile['wuid'])) {
                            $best['wuid'] = $profile['wuid'];
                        }
                        if (empty($best['status']) && ! empty($profile['status']['status'])) {
                            $best['status'] = $profile['status']['status'];
                        }
                        if (! empty($profile['isBusiness'])) {
                            $best['isBusiness'] = true;
                        }
                        if (empty($best['profilePicUrl']) && ! empty($profile['picture'])) {
                            $best['profilePicUrl'] = $profile['picture'];
                        }

                        try {
                            $biz = $evolution->fetchBusinessProfile($instance, $phone);
                            if (! empty($biz['isBusiness'])) {
                                $best['isBusiness'] = true;
                            }
                            if (empty($best['description']) && ! empty($biz['description'])) {
                                $best['description'] = $biz['description'];
                            }
                            if (empty($best['website']) && ! empty($biz['website'])) {
                                $best['website'] = $biz['website'];
                            }
                        } catch (\Exception $e) {
                            // business profile is optional
                        }

                        try {
                            $pic = $evolution->fetchProfilePictureUrl($instance, $phone);
                            if (empty($best['profilePicUrl']) && ! empty($pic['profilePictureUrl'])) {
                                $best['profilePicUrl'] = $pic['profilePictureUrl'];
                            }
                        } catch (\Exception $e) {
                            // picture URL is optional
                        }

                        break;
                    } catch (\Exception $e) {
                        continue;
                    }
                }

                if ($best['name'] !== null && preg_match('/^\d+$/', $best['name'])) {
                    $best['name'] = null;
                }

                $country = Contact::detectCountry($phone);

                $localPic = null;
                if ($best['profilePicUrl']) {
                    $localPic = $imageProxy->download($best['profilePicUrl']);
                }

                Contact::create([
                    'name' => $best['name'],
                    'phone' => $phone,
                    'whatsapp_id' => $best['wuid'],
                    'profile_pic_url' => $localPic,
                    'is_business' => $best['isBusiness'],
                    'wa_status' => $best['status'],
                    'description' => $best['description'],
                    'website' => $best['website'] ? (is_array($best['website']) ? $best['website'] : [$best['website']]) : null,
                    'country' => $country,
                    'is_active' => true,
                ]);

                $imported++;
            } catch (\Exception $e) {
                report($e);
                $errors[] = "Phone {$phone}: ".$e->getMessage();
            }
        }

        return response()->json([
            'imported' => $imported,
            'errors' => $errors,
        ]);
    }

    public function edit(Contact $contact, EvolutionApiService $evolution): Response
    {
        $instances = [];

        try {
            $instances = $evolution->fetchInstances();
        } catch (\Exception $e) {
            report($e);
        }

        $instanceNames = array_map(fn ($i) => $i['name'], $instances);

        $countries = Contact::whereNotNull('country')
            ->distinct()
            ->orderBy('country')
            ->pluck('country');

        return Inertia::render('admin/contacts/edit', [
            'contact' => $contact,
            'instances' => $instanceNames,
            'countries' => $countries,
        ]);
    }

    public function update(UpdateContactRequest $request, Contact $contact, ImageProxyService $imageProxy): RedirectResponse
    {
        $data = $request->validated();

        $data['is_active'] = $request->boolean('is_active', true);
        $data['is_business'] = $request->boolean('is_business', false);

        if (! empty($data['profile_pic_url']) && str_starts_with($data['profile_pic_url'], 'http')) {
            $localPath = $imageProxy->download($data['profile_pic_url']);
            if ($localPath) {
                $data['profile_pic_url'] = $localPath;
            }
        }

        $contact->update($data);

        return redirect()->route('admin.contacts.index')
            ->with('success', 'Contact updated successfully.');
    }

    public function destroy(Contact $contact): RedirectResponse
    {
        if (
            $contact->profile_pic_url
            && ! str_starts_with($contact->profile_pic_url, 'http')
            && ! str_starts_with($contact->profile_pic_url, '/storage/')
        ) {
            Storage::disk('public')->delete($contact->profile_pic_url);
        }

        $contact->delete();

        return redirect()->route('admin.contacts.index')
            ->with('success', 'Contact deleted successfully.');
    }

    public function batchDestroy(Request $request): RedirectResponse
    {
        $ids = $request->validate(['ids' => 'required|array', 'ids.*' => 'integer|exists:contacts,id'])['ids'];

        $contacts = Contact::whereIn('id', $ids)->get();

        foreach ($contacts as $contact) {
            if (
                $contact->profile_pic_url
                && ! str_starts_with($contact->profile_pic_url, 'http')
                && ! str_starts_with($contact->profile_pic_url, '/storage/')
            ) {
                Storage::disk('public')->delete($contact->profile_pic_url);
            }
        }

        Contact::whereIn('id', $ids)->delete();

        $count = count($ids);

        return redirect()->route('admin.contacts.index')
            ->with('success', "{$count} contact(s) deleted successfully.");
    }

    public function scanGroups(Request $request, EvolutionApiService $evolution): JsonResponse
    {
        set_time_limit(0);

        $request->validate([
            'instances' => 'required|array',
            'instances.*' => 'string',
        ]);

        $instanceNames = $request->input('instances');
        $groups = [];
        $errors = [];
        $allNewPhones = [];

        foreach ($instanceNames as $instance) {
            try {
                $raw = $evolution->fetchGroups($instance);

                foreach ($raw as $g) {
                    $groupJid = $g['id'] ?? '';
                    if (! str_ends_with($groupJid, '@g.us')) {
                        continue;
                    }

                    $participants = $g['participants'] ?? [];
                    $phones = [];
                    foreach ($participants as $p) {
                        $phone = str_replace('@s.whatsapp.net', '', $p['phoneNumber'] ?? '');
                        if ($phone) {
                            $phones[] = [
                                'phone' => $phone,
                                'name' => $p['name'] ?? null,
                                'is_admin' => ! empty($p['admin']),
                                'imgUrl' => $p['imgUrl'] ?? null,
                            ];
                            $allNewPhones[] = $phone;
                        }
                    }

                    $existingGroup = Contact::where('type', 'group')
                        ->where('whatsapp_id', $groupJid)
                        ->first();

                    $groups[] = [
                        'instance' => $instance,
                        'group_jid' => $groupJid,
                        'subject' => $g['subject'] ?? '(no name)',
                        'size' => $g['size'] ?? count($phones),
                        'picture_url' => $g['pictureUrl'] ?? null,
                        'description' => $g['desc'] ?? null,
                        'owner' => $g['owner'] ?? null,
                        'is_community' => $g['isCommunity'] ?? false,
                        'already_imported' => $existingGroup !== null,
                        'existing_group_id' => $existingGroup?->id,
                        'participants' => $phones,
                    ];
                }
            } catch (\Exception $e) {
                report($e);
                $errors[] = "Instance $instance: ".$e->getMessage();
            }
        }

        $existingPhones = Contact::where('type', 'individual')
            ->whereNotNull('phone')
            ->pluck('phone')
            ->map(fn ($p) => (string) $p)
            ->toArray();

        $newPhones = array_unique(array_diff($allNewPhones, $existingPhones));

        return response()->json([
            'groups' => $groups,
            'total_groups' => count($groups),
            'total_members' => count($allNewPhones),
            'new_contacts' => count($newPhones),
            'new_phones' => array_values($newPhones),
            'errors' => $errors,
        ]);
    }

    public function importGroupMembers(Request $request, EvolutionApiService $evolution, ImageProxyService $imageProxy): JsonResponse
    {
        set_time_limit(0);

        $request->validate([
            'group' => 'required|array',
            'group.instance' => 'required|string',
            'group.group_jid' => 'required|string',
            'group.subject' => 'nullable|string',
            'group.picture_url' => 'nullable|string',
            'group.description' => 'nullable|string',
            'group.owner' => 'nullable|string',
            'group.is_community' => 'boolean',
            'group.participants' => 'required|array',
            'group.participants.*.phone' => 'required|string',
            'group.participants.*.name' => 'nullable|string',
            'group.participants.*.is_admin' => 'boolean',
            'group.participants.*.imgUrl' => 'nullable|string',
        ]);

        $group = $request->input('group');
        $groupJid = $group['group_jid'];
        $instance = $group['instance'];
        $imported = 0;
        $errors = [];

        $instanceNames = [$instance];
        try {
            $instances = $evolution->fetchInstances();
            $instanceNames = array_map(fn ($i) => $i['name'], $instances);
        } catch (\Exception $e) {
            // fallback to group instance
        }

        try {
            $existingGroup = Contact::where('type', 'group')
                ->where('whatsapp_id', $groupJid)
                ->first();

            if ($existingGroup) {
                $groupId = $existingGroup->id;
            } else {
                $groupPic = null;
                if (! empty($group['picture_url'])) {
                    $groupPic = $imageProxy->download($group['picture_url']);
                }

                $groupContact = Contact::create([
                    'name' => $group['subject'] ?? '(no name)',
                    'type' => 'group',
                    'instance' => $instance,
                    'whatsapp_id' => $groupJid,
                    'profile_pic_url' => $groupPic,
                    'participant_count' => count($group['participants']),
                    'owner' => $group['owner'] ?? null,
                    'is_community' => $group['is_community'] ?? false,
                    'notes' => $group['description'] ?? null,
                    'is_active' => true,
                    'last_synced_at' => now(),
                ]);

                $groupId = $groupContact->id;
            }

            foreach ($group['participants'] as $participant) {
                try {
                    $phone = $participant['phone'];
                    $contact = Contact::where('type', 'individual')
                        ->where('phone', $phone)
                        ->first();

                    if ($contact) {
                        $groupJids = $contact->group_jids ?? [];
                        if (! in_array($groupJid, $groupJids)) {
                            $groupJids[] = $groupJid;
                            $contact->update(['group_jids' => $groupJids]);
                        }
                    } else {
                        $best = [
                            'name' => $participant['name'] ?? null,
                            'wuid' => "{$phone}@s.whatsapp.net",
                            'profilePicUrl' => $participant['imgUrl'] ?? null,
                            'isBusiness' => false,
                            'status' => null,
                            'description' => null,
                            'website' => null,
                        ];

                        foreach ($instanceNames as $inst) {
                            try {
                                $profile = $evolution->fetchProfile($inst, $phone);

                                if (empty($best['name']) && ! empty($profile['name'])) {
                                    $best['name'] = $profile['name'];
                                }
                                if (empty($best['wuid']) && ! empty($profile['wuid'])) {
                                    $best['wuid'] = $profile['wuid'];
                                }
                                if (empty($best['status']) && ! empty($profile['status']['status'])) {
                                    $best['status'] = $profile['status']['status'];
                                }
                                if (! empty($profile['isBusiness'])) {
                                    $best['isBusiness'] = true;
                                }
                                if (empty($best['profilePicUrl']) && ! empty($profile['picture'])) {
                                    $best['profilePicUrl'] = $profile['picture'];
                                }

                                try {
                                    $biz = $evolution->fetchBusinessProfile($inst, $phone);
                                    if (! empty($biz['isBusiness'])) {
                                        $best['isBusiness'] = true;
                                    }
                                    if (empty($best['description']) && ! empty($biz['description'])) {
                                        $best['description'] = $biz['description'];
                                    }
                                    if (empty($best['website']) && ! empty($biz['website'])) {
                                        $best['website'] = $biz['website'];
                                    }
                                } catch (\Exception $e) {
                                    // business profile is optional
                                }

                                try {
                                    $pic = $evolution->fetchProfilePictureUrl($inst, $phone);
                                    if (empty($best['profilePicUrl']) && ! empty($pic['profilePictureUrl'])) {
                                        $best['profilePicUrl'] = $pic['profilePictureUrl'];
                                    }
                                } catch (\Exception $e) {
                                    // picture URL is optional
                                }

                                break;
                            } catch (\Exception $e) {
                                continue;
                            }
                        }

                        if ($best['name'] !== null && preg_match('/^\d+$/', $best['name'])) {
                            $best['name'] = null;
                        }

                        $country = Contact::detectCountry($phone);

                        $localPic = null;
                        if ($best['profilePicUrl']) {
                            $localPic = $imageProxy->download($best['profilePicUrl']);
                        }

                        Contact::create([
                            'name' => $best['name'],
                            'phone' => $phone,
                            'type' => 'individual',
                            'instance' => $instance,
                            'whatsapp_id' => $best['wuid'],
                            'profile_pic_url' => $localPic,
                            'group_jids' => [$groupJid],
                            'is_business' => $best['isBusiness'],
                            'wa_status' => $best['status'],
                            'description' => $best['description'],
                            'website' => $best['website'] ? (is_array($best['website']) ? $best['website'] : [$best['website']]) : null,
                            'country' => $country,
                            'is_active' => true,
                        ]);
                    }

                    $imported++;
                } catch (\Exception $e) {
                    report($e);
                    $errors[] = "Phone {$participant['phone']}: ".$e->getMessage();
                }
            }
        } catch (\Exception $e) {
            report($e);
            $errors[] = "Group {$groupJid}: ".$e->getMessage();
        }

        return response()->json([
            'imported' => $imported,
            'errors' => $errors,
        ]);
    }
}
