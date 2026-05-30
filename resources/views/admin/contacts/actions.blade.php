<a href="{{ route('admin.contacts.edit', $contact) }}" class="btn btn-sm btn-primary">Edit</a>
<form action="{{ route('admin.contacts.destroy', $contact) }}" method="POST" class="d-inline" onsubmit="return confirm('Delete this contact?')">
    @csrf
    @method('DELETE')
    <button type="submit" class="btn btn-sm btn-danger">Delete</button>
</form>
