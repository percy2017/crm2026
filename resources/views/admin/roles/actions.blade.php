<button type="button" class="btn btn-sm btn-info view-role" data-id="{{ $role->id }}">View</button>
<form action="{{ route('admin.roles.destroy', $role) }}" method="POST" class="d-inline" onsubmit="return confirm('Are you sure you want to delete this role?')">
    @csrf
    @method('DELETE')
    <button type="submit" class="btn btn-sm btn-danger" {{ $role->name === 'admin' ? 'disabled' : '' }}>Delete</button>
</form>
