import React, { useState } from 'react';
import { Smartphone, MessageSquare, Trash2, Power } from 'lucide-react';
import type { WhatsAppInstance } from '../types';
import { deleteInstance, turnOffInstance } from '../api';
import { toast } from 'react-hot-toast';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

interface InstanceCardProps {
  instance: WhatsAppInstance;
  onViewInstance: (instance: WhatsAppInstance) => void;
  locationId: string;
  onInstanceDeleted?: () => void;
  onInstanceUpdated?: () => void;
}

export const InstanceCard: React.FC<InstanceCardProps> = ({ 
  instance, 
  onViewInstance,
  locationId,
  onInstanceDeleted,
  onInstanceUpdated
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTurningOff, setIsTurningOff] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteInstance(locationId, instance.instance_name);
      toast.success('Instancia eliminada correctamente');
      onInstanceDeleted?.();
    } catch (error) {
      toast.error('Error al eliminar la instancia');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleTurnOff = async () => {
    try {
      setIsTurningOff(true);
      await turnOffInstance(locationId, instance.instance_name);
      toast.success('Instancia desconectada correctamente');
      onInstanceUpdated?.();
    } catch (error) {
      toast.error('Error al desconectar la instancia');
    } finally {
      setIsTurningOff(false);
    }
  };

  const getStatusColor = (connectionStatus: string | undefined) => {
    if (!connectionStatus) return 'bg-yellow-500';
    
    switch (connectionStatus.toLowerCase()) {
      case 'connected':
      case 'open':
        return 'bg-green-500';
      case 'disconnected':
      case 'closed':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const getStatusText = (connectionStatus: string | undefined) => {
    if (!connectionStatus) return 'Pendiente';
    
    switch (connectionStatus.toLowerCase()) {
      case 'connected':
      case 'open':
        return 'Conectado';
      case 'disconnected':
      case 'closed':
        return 'Desconectado';
      default:
        return 'Pendiente';
    }
  };

  const isConnected = instance.connectionStatus?.toLowerCase() === 'connected' || 
                     instance.connectionStatus?.toLowerCase() === 'open';

  return (
    <>
      <div className="bg-white rounded-lg shadow-xl p-6 space-y-4 hover:shadow-2xl transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-6 h-6 text-gray-600" />
            <h3 className="text-lg font-semibold">{instance.instance_name}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-block w-3 h-3 rounded-full ${getStatusColor(instance.connectionStatus)}`}></span>
            <span className="text-sm text-gray-600">
              {getStatusText(instance.connectionStatus)}
            </span>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500">ID: {instance.instance_id}</p>
          <p className="text-sm text-gray-500">Nombre: {instance.instance_name}</p>
        </div>
        
        <div className="flex justify-end items-center space-x-2">
          {!isConnected && (
            <button
              onClick={() => onViewInstance(instance)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ver QR</span>
            </button>
          )}
          {isConnected && (
            <button
              onClick={handleTurnOff}
              disabled={isTurningOff}
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors disabled:bg-yellow-300"
            >
              <Power className="w-4 h-4" />
              <span>{isTurningOff ? 'Desconectando...' : 'Desconectar'}</span>
            </button>
          )}
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting}
            className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:bg-red-300"
            title="Eliminar instancia"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        instanceName={instance.instance_name}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isDeleting={isDeleting}
      />
    </>
  );
};
