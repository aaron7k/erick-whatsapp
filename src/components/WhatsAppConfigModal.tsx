import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Switch } from './Switch';
import { User } from '../types';
import { toast } from 'react-hot-toast';

interface WhatsAppConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: {
    alias: string;
    userId?: string;
    isMainDevice: boolean;
    facebookAds: boolean;
  }, userData?: User) => void;
  users: User[];
  loading?: boolean;
  initialConfig?: {
    alias?: string;
    userId?: string;
    isMainDevice?: boolean;
    facebookAds?: boolean;
  };
  existingMainDevice?: boolean;
  isEditing?: boolean;
}

export const WhatsAppConfigModal: React.FC<WhatsAppConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  users,
  loading,
  initialConfig,
  existingMainDevice,
  isEditing
}) => {
  const [alias, setAlias] = useState(initialConfig?.alias || '');
  const [userId, setUserId] = useState(initialConfig?.userId || '');
  const [isMainDevice, setIsMainDevice] = useState(initialConfig?.isMainDevice || false);
  const [facebookAds, setFacebookAds] = useState(initialConfig?.facebookAds || false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    if (initialConfig) {
      setAlias(initialConfig.alias || '');
      setUserId(initialConfig.userId || '');
      setIsMainDevice(initialConfig.isMainDevice || false);
      setFacebookAds(initialConfig.facebookAds || false);
    }
  }, [initialConfig]);

  useEffect(() => {
    if (userId) {
      const user = users.find(u => u.id === userId);
      setSelectedUser(user || null);
    } else {
      setSelectedUser(null);
    }
  }, [userId, users]);

  const handleMainDeviceChange = (checked: boolean) => {
    if (checked && existingMainDevice && !initialConfig?.isMainDevice) {
      toast.error('Ya existe un dispositivo principal');
      return;
    }
    setIsMainDevice(checked);
    if (checked) {
      setUserId('');
      setSelectedUser(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!alias.trim()) {
      toast.error('El alias es requerido');
      return;
    }

    if (!isMainDevice && !userId) {
      toast.error('Debe seleccionar un usuario');
      return;
    }

    onSave({
      alias,
      userId: isMainDevice ? undefined : userId,
      isMainDevice,
      facebookAds
    }, selectedUser || undefined);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">
            {isEditing ? 'Editar WhatsApp' : 'Crear WhatsApp'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600 text-center">Cargando usuarios...</p>
            <p className="text-sm text-gray-500 text-center mt-2">
              Por favor espere mientras obtenemos la información
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alias de WhatsApp
              </label>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingrese un alias"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuario Asignado
              </label>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                disabled={isMainDevice}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Seleccione un usuario</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Dispositivo Principal</span>
                <Switch
                  checked={isMainDevice}
                  onChange={handleMainDeviceChange}
                  disabled={existingMainDevice && !initialConfig?.isMainDevice}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Facebook ADS</span>
                <Switch
                  checked={facebookAds}
                  onChange={setFacebookAds}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
              >
                {isEditing ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default WhatsAppConfigModal;
