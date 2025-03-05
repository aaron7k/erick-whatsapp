import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { InstanceCard } from './components/InstanceCard';
import { WhatsAppConfigModal } from './components/WhatsAppConfigModal';
import { LoadingOverlay } from './components/LoadingOverlay';
import { createInstance, listInstances, getUsers, editInstance, getInstanceConfig } from './api';
import type { WhatsAppInstance, SingleInstanceResponse, User, InstanceConfig } from './types';
import InstanceDetailPage from './pages/InstanceDetailPage';

const LOCATION_ID = import.meta.env.VITE_LOCATION_ID;

export const App: React.FC = () => {
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<WhatsAppInstance | null>(null);
  const [configInstance, setConfigInstance] = useState<SingleInstanceResponse['data'] | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Add this line to calculate hasMainDevice
  const hasMainDevice = instances.some(instance => instance.main_device);

  const loadInstances = useCallback(async () => {
    try {
      const instancesList = await listInstances(LOCATION_ID);
      setInstances(instancesList);
    } catch (error) {
      toast.error('Error al cargar las instancias');
      setInstances([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const usersList = await getUsers(LOCATION_ID);
      setUsers(usersList);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar los usuarios');
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    loadInstances();
  }, [loadInstances]);

  const handleOpenModal = useCallback(async () => {
    if (instances.length >= 5) {
      toast.error('Número máximo de instancias (5) alcanzado');
      return;
    }
    
    setLoadingUsers(true);
    try {
      await loadUsers();
      setIsEditing(false);
      setConfigInstance(null);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar los usuarios');
    } finally {
      setLoadingUsers(false);
    }
  }, [instances.length, loadUsers]);

  const handleEditConfig = useCallback(async (instance: WhatsAppInstance) => {
    setLoadingUsers(true);
    try {
      await loadUsers();
      const instanceConfig = await getInstanceConfig(LOCATION_ID, instance.instance_id.toString());
      setIsEditing(true);
      setConfigInstance(instanceConfig);
      setIsModalOpen(true);
    } catch (error) {
      toast.error('Error al obtener la configuración de la instancia');
    } finally {
      setLoadingUsers(false);
    }
  }, [loadUsers]);

  const handleSaveConfig = useCallback(async (config: InstanceConfig, userData?: User) => {
    setIsSaving(true);
    try {
      if (isEditing && configInstance) {
        await editInstance(LOCATION_ID, configInstance.instance_name, config);
        toast.success('Configuración actualizada correctamente');
      } else {
        const userDetails = userData ? {
          user_name: userData.name,
          user_email: userData.email,
          user_phone: userData.phone || ''
        } : undefined;

        await createInstance(LOCATION_ID, config, userDetails);
        toast.success('WhatsApp creado correctamente');
      }
      await loadInstances();
      setIsModalOpen(false);
    } catch (error) {
      toast.error(isEditing ? 'Error al actualizar la configuración' : 'Error al crear WhatsApp');
    } finally {
      setIsSaving(false);
    }
  }, [isEditing, configInstance, loadInstances]);

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
      {isSaving && <LoadingOverlay message="Creando WhatsApp..." />}

      <div className="max-w-7xl mx-auto">
        {selectedInstance ? (
          <InstanceDetailPage
            instance={selectedInstance}
            locationId={LOCATION_ID}
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
                  locationId={LOCATION_ID}
                  onInstanceDeleted={handleInstanceDeleted}
                  onInstanceUpdated={handleInstanceUpdated}
                  onEditConfig={handleEditConfig}
                />
              ))}
            </div>

            <WhatsAppConfigModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSave={handleSaveConfig}
              users={users}
              loading={loadingUsers}
              initialConfig={configInstance ? {
                alias: configInstance.instance_alias,
                userId: configInstance.user_id,
                isMainDevice: configInstance.main_device,
                facebookAds: configInstance.fb_ads
              } : undefined}
              existingMainDevice={hasMainDevice}
              isEditing={isEditing}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default App;
