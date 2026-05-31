<a href="{{ route('admin.deals.show', $deal) }}" class="btn btn-sm btn-info view-deal" data-id="{{ $deal->id }}">View</a>
<form action="{{ route('admin.deals.destroy', $deal) }}" method="POST" class="d-inline" onsubmit="return confirm('Are you sure you want to delete this deal?')">
    @csrf
    @method('DELETE')
    <button type="submit" class="btn btn-sm btn-danger">Delete</button>
</form>
