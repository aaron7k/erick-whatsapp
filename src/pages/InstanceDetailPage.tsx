import React, { useState, useEffect, useCallback, useRef } from 'react';
import { refreshQRCode, getInstanceData } from '../api';
import { Loader2, X } from 'lucide-react';
import type { WhatsAppInstance, InstanceData } from '../types';
import { toast } from 'react-hot-toast';

interface InstanceDetailPageProps {
  instance: WhatsAppInstance;
  locationId: string;
  onGoBack: () => void;
  onQRCodeUpdated: (instanceId: string, qrcode: string) => void;
}

const InstanceDetailPage: React.FC<InstanceDetailPageProps> = ({
  instance,
  locationId,
  onGoBack,
  onQRCodeUpdated,
}) => {
  const [qrcode, setQrcode] = useState<string | undefined>(instance?.qrcode);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [instanceData, setInstanceData] = useState<InstanceData | null>(null);
  const pollingInterval = useRef<NodeJS.Timeout>();

  const getQR = useCallback(async () => {
    if (!instance?.instance_name) return;

    try {
      const response = await refreshQRCode(locationId, instance.instance_name);
      
      if (response?.qrcode) {
        setQrcode(response.qrcode);
        onQRCodeUpdated(instance.instance_id.toString(), response.qrcode);
      }

      // Verificar si el estado es "open"
      if (response?.state === 'open') {
        setIsConnected(true);
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
        }
        
        // Obtener datos de la instancia
        const data = await getInstanceData(locationId, instance.instance_name);
        if (data) {
          setInstanceData(data);
          toast.success('WhatsApp conectado correctamente');
        }
      }
    } catch {
      // Silenciar el error
    } finally {
      setIsLoading(false);
    }
  }, [instance, locationId, onQRCodeUpdated]);

  useEffect(() => {
    getQR();
    pollingInterval.current = setInterval(getQR, 30000);

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [getQR]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {isConnected ? 'WhatsApp Conectado' : 'Código QR de'} {instance.instance_name}
          </h2>
          <button 
            onClick={onGoBack} 
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-600">Obteniendo código QR...</p>
            </div>
          ) : isConnected && instanceData ? (
            <div className="text-center py-4">
              <div className="flex flex-col items-center">
                {instanceData.photo && (
                  <img 
                    src={instanceData.photo}
                    alt="Perfil de WhatsApp" 
                    className="w-24 h-24 rounded-full mb-4"
                  />
                )}
                <p className="text-green-600 font-semibold mb-2">
                  ¡WhatsApp conectado exitosamente!
                </p>
                <p className="text-gray-700 font-medium">
                  {instanceData.name}
                </p>
                <p className="text-gray-600">
                  {instanceData.number}
                </p>
              </div>
            </div>
          ) : qrcode ? (
            <div className="flex flex-col items-center">
              <img 
                src={qrcode}
                alt="Código QR de WhatsApp" 
                className="w-64 h-64 mb-4"
              />
              <p className="text-sm text-gray-500 text-center">
                Escanea el código QR con tu WhatsApp para conectarte.<br/>
                El código se actualiza automáticamente cada 30 segundos.
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">
                Esperando código QR...
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">Detalles de la instancia:</p>
          <p className="text-sm text-gray-600">ID: {instance.instance_id}</p>
          <p className="text-sm text-gray-600">Nombre: {instance.instance_name}</p>
          <p className="text-sm text-gray-600">Estado: {isConnected ? 'Conectado' : 'Pendiente'}</p>
          {isConnected && instanceData && (
            <>
              <p className="text-sm text-gray-600">Nombre de WhatsApp: {instanceData.name}</p>
              <p className="text-sm text-gray-600">Número: {instanceData.number}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstanceDetailPage;
