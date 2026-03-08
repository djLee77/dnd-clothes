import { useEffect, useState } from 'react';
import { X, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FollowUser {
  id: number;
  username: string;
  handle: string;
  profile_image: string | null;
  bio: string | null;
}

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'followers' | 'following';
  handle: string; // The user's handle to fetch
}

export const FollowListModal = ({ isOpen, onClose, type, handle }: FollowListModalProps) => {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && handle) {
      setLoading(true);
      const fetchUsers = async () => {
        try {
          const API_URL = import.meta.env.VITE_API_URL || '/api';
          const handleStr = handle.startsWith('#') ? handle.substring(1) : handle;
          const res = await fetch(`${API_URL}/users/${handleStr}/${type}`);
          if (res.ok) {
            const data = await res.json();
            setUsers(data);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchUsers();
    }
  }, [isOpen, type, handle]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">{type === 'followers' ? '팔로워' : '팔로우'}</h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
             <div className="flex justify-center items-center py-10">
               <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
             </div>
          ) : users.length > 0 ? (
            <div className="flex flex-col">
              {users.map((u) => (
                <div 
                  key={u.id} 
                  onClick={() => {
                    onClose();
                    navigate(`/profile/${u.handle.replace('#', '')}`);
                  }}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                    {u.profile_image ? (
                      <img src={u.profile_image} alt={u.username} className="w-full h-full object-cover" />
                    ) : (
                      <User size={18} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <span className="text-sm font-bold text-gray-900 leading-tight flex items-center">
                      <span className="truncate max-w-[120px]">{u.username}</span>
                      {u.handle && <span className="ml-1.5 font-medium text-gray-400/80 shrink-0">{u.handle}</span>}
                    </span>
                    {u.bio && (
                      <span className="text-[11px] text-gray-500 truncate mt-0.5">{u.bio}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-sm font-bold text-gray-400">
              {type === 'followers' ? '팔로워가 없습니다.' : '팔로우하는 사용자가 없습니다.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
