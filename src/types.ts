export interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface UserResponse {
  data: UserData[];
  instancias: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface WhatsAppInstance {
  id: string;
  instance_id: number;
  instance_name: string;
  instance_alias: string;
  main_device: boolean;
  fb_ads: boolean;
  apikey: string;
  location_id: string | null;
  token: string | null;
  status?: string;
  connectionStatus?: string;
  qrcode?: string;
  userId?: string;
  ownerJid?: string;
  profilePicUrl?: string;
}

export interface InstanceConfig {
  alias: string;
  userId?: string;
  isMainDevice: boolean;
  facebookAds: boolean;
  instance_name?: string;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
}

export interface APIResponse {
  status?: string;
  state?: string;
  qrcode?: string;
  error?: string;
  message?: string;
}

export interface ListInstancesResponse {
  data: WhatsAppInstance[];
  message: string;
  status: boolean;
}

export interface SingleInstanceResponse {
  data: {
    instance_id: number;
    instance_name: string;
    apikey: string;
    token: string | null;
    user_id: string;
    locationId: string;
    user_name: string;
    user_email: string;
    user_phone: string;
    main_device: boolean;
    fb_ads: boolean;
    instance_alias: string;
  };
  message: string;
  status: boolean;
}

export interface InstanceData {
  name: string;
  number: string;
  photo: string;
  ownerJid?: string;
  profilePicUrl?: string;
}
