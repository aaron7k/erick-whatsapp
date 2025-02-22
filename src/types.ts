export interface WhatsAppInstance {
  id: string;
  instance_id: number;
  instance_name: string;
  apikey: string;
  location_id: string | null;
  token: string | null;
  status?: string;
  connectionStatus?: string;
  qrcode?: string;
  user_name?: string;
  user_phone?: string;
  user_mail?: string;
}

// ... resto de las interfaces igual ...
