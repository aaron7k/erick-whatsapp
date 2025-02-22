import React from 'react';
import { X, Loader2 } from 'lucide-react';
import { User } from '../types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onSelectUser: (userId: string, name: string, phone: string, email: string, instanceNumber: number) => void;
  loading: boolean;
  totalInstances: number;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  users,
  onSelectUser,
  loading,
  totalInstances
}) => {
  const [selectedUserId, setSelectedUserId] = React.useState('');
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [creatingInstance, setCreatingInstance] = React.useState(false);

  React.useEffect(() => {
    if (users && users.length > 0) {
      setSelectedUserId(users[0].id);
      setSelectedUser(users[0]);
    }
  }, [users]);

  if (!isOpen) return null;

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = event.target.value;
    setSelectedUserId(userId);
    const user = users.find(u => u.id === userId) || null;
    setSelectedUser(user);
  };

  const handleSubmit = async () => {
    if (selectedUser) {
      setCreatingInstance(true);
      const nextInstanceNumber = totalInstances + 1;
      await onSelectUser(
        selectedUser.id,
        selectedUser.name,
        selectedUser.phone,
        selectedUser.email,
        nextInstanceNumber
      );
      setCreatingInstance(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {creatingInstance && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-green-500 animate-spin mb-4" />
            <p className="text-lg font-semibold">Creando instancia de WhatsApp...</p>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Seleccionar Usuario</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 text-green-500 animate-spin mx-auto mb-2" />
            <p>Cargando usuarios...</p>
          </div>
        ) : !Array.isArray(users) ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Error: Usuarios no cargados correctamente.</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No hay usuarios disponibles</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label htmlFor="userSelect" className="block text-gray-700 text-sm font-bold mb-2">
                Seleccionar Usuario:
              </label>
              <select
                id="userSelect"
                value={selectedUserId}
                onChange={handleSelectChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={creatingInstance}
              >
                Crear Instancia
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
