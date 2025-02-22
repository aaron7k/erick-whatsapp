import axios from 'axios';
import { APIResponse, ListInstancesResponse, User, GetUsersResponse, InstanceData } from './types';

const BASE_URL = 'https://api.connectleads.pro/webhook/whatsapp';

export const getUsers = async (locationId: string): Promise<User[]> => {
  try {
    const response = await axios.get<GetUsersResponse>(`${BASE_URL}/get-users`, {
      params: { locationId }
    });
    return response.data.data || [];
  } catch (error) {
    throw new Error('Error al obtener la lista de usuarios');
  }
};

export const listInstances = async (locationId: string): Promise<ListInstancesResponse> => {
  try {
    const response = await axios.get(`${BASE_URL}/ver-instancias`, {
      params: { locationId }
    });
    const instances = response.data?.data || [];
    return { instances };
  } catch (error) {
    throw new Error('Error al obtener las instancias de WhatsApp');
  }
};

export const createInstance = async (
  locationId: string, 
  userId: string, 
  name: string, 
  phone: string, 
  email: string, 
  instanceNumber: number
): Promise<APIResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}/create-instance`, { 
      locationId,
      userId,
      name,
      phone,
      email,
      instanceNumber
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

export const deleteInstance = async (locationId: string, instanceName: string): Promise<any> => {
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
    const response = await axios.post(`${BASE_URL}/get-instance-data`, {
      locationId,
      instanceName
    });
    return response.data;
  } catch (error) {
    return { name: '', number: '', photo: '' };
  }
};

export const turnOffInstance = async (locationId: string, instanceName: string): Promise<any> => {
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
