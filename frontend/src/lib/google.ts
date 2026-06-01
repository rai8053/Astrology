let _promise: Promise<string> | null = null;
let _cached = '';

export function fetchGoogleClientId(): Promise<string> {
  if (_cached) return Promise.resolve(_cached);
  if (!_promise) {
    _promise = fetch('/api/auth/google/client-id')
      .then((r) => r.json())
      .then((d) => {
        _cached = d?.success && d?.data?.clientId ? d.data.clientId : '';
        return _cached;
      })
      .catch(() => {
        _cached = '';
        return '';
      });
  }
  return _promise;
}
