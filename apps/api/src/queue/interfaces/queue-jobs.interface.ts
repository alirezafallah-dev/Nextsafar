export interface NotificationJobData {
  notificationId: string;
  userId?: string;
  channel: 'SMS' | 'EMAIL' | 'INTERNAL' | 'WHATSAPP';
  recipient: string;
  subject?: string;
  template: string;
  data?: any;
}

export interface AuditLogJobData {
  adminId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: any;
  ip?: string;
  userAgent?: string;
}

export interface OrderEventJobData {
  orderId: string;
  event: string;
  metadata?: any;
}
