import axios from 'axios';
import { 
  APIResponse, 
  User, 
  UserResponse,
  InstanceData, 
  WhatsAppInstance,
  InstanceConfig, 
  ListInstancesResponse,
  SingleInstanceResponse 
} from './types';

const BASE_URL = 'https://api.connectleads.pro/webhook/whatsapp';

export const getUsers = async (locationId: string): Promise<User[]> => {
  try {
    const response = await axios.get<UserResponse>(
      `${BASE_URL}/get-users`,
      {
        params: { locationId }
      }
    );
    
    if (response.data && response.data.data) {
      return response.data.data.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Error al obtener la lista de usuarios');
  }
};

export const listInstances = async (locationId: string): Promise<WhatsAppInstance[]> => {
  try {
    const response = await axios.get<ListInstancesResponse>(`${BASE_URL}/ver-instancias`, {
      params: { locationId }
    });
    return response.data.data || [];
  } catch (error) {
    throw new Error('Error al obtener las instancias de WhatsApp');
  }
};

export const createInstance = async (
  locationId: string,
  config: InstanceConfig,
  userData?: {
    user_name?: string;
    user_email?: string;
    user_phone?: string;
  }
): Promise<APIResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}/create-instance`, {
      locationId,
      ...config,
      ...(userData && {
        user_name: userData.user_name,
        user_email: userData.user_email,
        user_phone: userData.user_phone
      })
    });
    return response.data;
  } catch (error) {
    throw new Error('Error al crear la instancia de WhatsApp');
  }
};

export const refreshQRCode = async (locationId: string, instanceName: string): Promise<APIResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}/get-qr`, {
      locationId,
      instanceName
    });
    return response.data;
  } catch (error) {
    return { error: 'Error al obtener QR' };
  }
};

export const deleteInstance = async (locationId: string, instanceName: string): Promise<APIResponse> => {
  try {
    const response = await axios.delete(`${BASE_URL}/delete-instance`, {
      data: {
        locationId,
        instanceName
      }
    });
    return response.data;
  } catch (error) {
    throw new Error('Error al eliminar la instancia');
  }
};

export const getInstanceData = async (locationId: string, instanceName: string): Promise<InstanceData> => {
  try {
    const response = await axios.post<InstanceData>(`${BASE_URL}/get-instance-data`, {
      locationId,
      instanceName
    });
    return response.data;
  } catch (error) {
    return { name: '', number: '', photo: '' };
  }
};

export const turnOffInstance = async (locationId: string, instanceName: string): Promise<APIResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}/turn-off`, {
      locationId,
      instanceName
    });
    return response.data;
  } catch (error) {
    throw new Error('Error al desconectar la instancia');
  }
};

export const editInstance = async (
  locationId: string,
  instanceName: string,
  config: InstanceConfig
): Promise<APIResponse> => {
  try {
    const response = await axios.put(`${BASE_URL}/edit-instance`, {
      locationId,
      instanceName,
      ...config
    });
    return response.data;
  } catch (error) {
    throw new Error('Error al actualizar la configuración de la instancia');
  }
};

export const getInstanceConfig = async (locationId: string, instanceId: string): Promise<SingleInstanceResponse['data']> => {
  try {
    const response = await axios.get<SingleInstanceResponse>(`${BASE_URL}/ver-instancia`, {
      params: { locationId, instanceId }
    });
    
    if (!response.data.data) {
      throw new Error('No se encontró la configuración de la instancia');
    }
    
    return response.data.data;
  } catch (error) {
    throw new Error('Error al obtener la configuración de la instancia');
  }
};
