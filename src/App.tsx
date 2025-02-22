import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { InstanceCard } from './components/InstanceCard';
import { UserModal } from './components/UserModal';
import { LoadingOverlay } from './components/LoadingOverlay';
import { createInstance, listInstances, getUsers } from './api';
import type { WhatsAppInstance, User } from './types';
import InstanceDetailPage from './pages/InstanceDetailPage';

const getLocationIdFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('locationId');
};

const App = () => {
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalInstances, setTotalInstances] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<WhatsAppInstance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);

  useEffect(() => {
    const id = getLocationIdFromUrl();
    if (!id) {
      setError('LocationId no proporcionado en la URL');
      setLoading(false);
    } else {
      setLocationId(id);
    }
  }, []);

  const loadInstances = useCallback(async () => {
    if (!locationId) return;

    try {
      const response = await listInstances(locationId);
      if (response && Array.isArray(response.instances)) {
        setInstances(response.instances);
        setTotalInstances(response.instances.length);
      } else {
        setInstances([]);
        setTotalInstances(0);
      }
    } catch (error) {
      toast.error('Error al cargar las instancias');
      setInstances([]);
      setTotalInstances(0);
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  const loadUsers = useCallback(async () => {
    if (!locationId) return;

    setLoadingUsers(true);
    try {
      const usersList = await getUsers(locationId);
      setUsers(usersList);
    } catch (error) {
      toast.error('Error al cargar los usuarios');
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, [locationId]);

  useEffect(() => {
    if (locationId) {
      loadInstances();
    }
  }, [loadInstances, locationId]);

  const handleOpenModal = useCallback(async () => {
    if (instances.length >= 5) {
      toast.error('Número máximo de instancias (5) alcanzado');
      return;
    }
    await loadUsers();
    setIsModalOpen(true);
  }, [instances.length, loadUsers]);

  const handleCreateInstance = useCallback(async (userId: string, name: string, phone: string, email: string, instanceNumber: number) => {
    if (!locationId) return;

    setIsCreating(true);
    try {
      await createInstance(locationId, userId, name, phone, email, instanceNumber);
      toast.success('Nueva instancia de WhatsApp creada');
      await loadInstances();
    } catch (error) {
      toast.error('Error al crear la instancia de WhatsApp');
    } finally {
      setIsCreating(false);
      setIsModalOpen(false);
    }
  }, [locationId, loadInstances]);

  const handleSelectUser = useCallback((userId: string, name: string, phone: string, email: string, instanceNumber: number) => {
    handleCreateInstance(userId, name, phone, email, instanceNumber);
  }, [handleCreateInstance]);

  const handleViewInstance = (instance: WhatsAppInstance) => {
    setSelectedInstance(instance);
  };

  const handleGoBack = () => {
    setSelectedInstance(null);
    loadInstances();
  };

  const handleInstanceDeleted = useCallback(() => {
    loadInstances();
  }, [loadInstances]);

  const handleInstanceUpdated = useCallback(() => {
    loadInstances();
  }, [loadInstances]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-600 text-center">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Cargando instancias...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Toaster position="top-right" />
      {isCreating && <LoadingOverlay />}

      <div className="max-w-7xl mx-auto">
        {selectedInstance ? (
          <InstanceDetailPage
            instance={selectedInstance}
            locationId={locationId || ''}
            onGoBack={handleGoBack}
            onQRCodeUpdated={() => {}}
          />
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Números de WhatsApp</h1>
              <button
                onClick={handleOpenModal}
                disabled={instances.length >= 5}
                className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
                <span>Crear WhatsApp</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {instances.map(instance => (
                <InstanceCard
                  key={instance.instance_id}
                  instance={instance}
                  onViewInstance={handleViewInstance}
                  locationId={locationId || ''}
                  onInstanceDeleted={handleInstanceDeleted}
                  onInstanceUpdated={handleInstanceUpdated}
                />
              ))}
            </div>

            <UserModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              users={users}
              onSelectUser={handleSelectUser}
              loading={loadingUsers}
              totalInstances={totalInstances}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default App;
