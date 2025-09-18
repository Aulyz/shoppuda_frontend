import { useAuthStore } from '../store/authStore';

export default function UserDebug() {
  const { user, isAuthenticated, accessToken } = useAuthStore();

  if (!isAuthenticated) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🔍 User Debug Info</h3>
      <div className="space-y-1">
        <p><span className="text-yellow-400">ID:</span> {user?.id || 'N/A'}</p>
        <p><span className="text-yellow-400">Username:</span> {user?.username || 'N/A'}</p>
        <p><span className="text-yellow-400">Email:</span> {user?.email || 'N/A'}</p>
        <p><span className="text-yellow-400">First Name:</span> {user?.first_name || 'N/A'}</p>
        <p><span className="text-yellow-400">Last Name:</span> {user?.last_name || 'N/A'}</p>
        <p><span className="text-yellow-400">Type:</span> {user?.type || user?.loginType || 'N/A'}</p>
        <p><span className="text-yellow-400">Has Token:</span> {accessToken ? 'Yes' : 'No'}</p>
      </div>
      <button 
        onClick={() => {
          console.log('Full user object:', user);
          console.log('Auth store state:', useAuthStore.getState());
        }}
        className="mt-2 px-2 py-1 bg-white/20 rounded text-xs hover:bg-white/30"
      >
        Log to Console
      </button>
    </div>
  );
}