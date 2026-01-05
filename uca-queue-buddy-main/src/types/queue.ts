export type ServiceType = 'teller' | 'customer_service' | 'loan';

export interface ServiceTypeInfo {
  id: ServiceType;
  name: string;
  prefix: string;
  description: string;
  icon: string;
  estimatedTime: number; // in minutes
}

export interface QueueTicket {
  id: string;
  number: number;
  displayNumber: string;
  serviceType: ServiceType;
  status: 'waiting' | 'serving' | 'completed' | 'skipped';
  createdAt: Date;
  calledAt?: Date;
  completedAt?: Date;
  counter?: number;
}

export interface Counter {
  id: number;
  name: string;
  serviceType: ServiceType;
  isActive: boolean;
  currentTicket?: QueueTicket;
  officerName?: string;
}

export interface QueueStats {
  date: string;
  totalServed: number;
  totalSkipped: number;
  averageWaitTime: number; // in minutes
  averageServiceTime: number; // in minutes
  byService: {
    [key in ServiceType]: {
      total: number;
      served: number;
      skipped: number;
      avgWaitTime: number;
    };
  };
  hourlyData: {
    hour: number;
    count: number;
  }[];
}

export const SERVICE_TYPES: ServiceTypeInfo[] = [
  {
    id: 'teller',
    name: 'Teller',
    prefix: 'A',
    description: 'Setor, tarik tunai, transfer',
    icon: 'Banknote',
    estimatedTime: 5,
  },
  {
    id: 'customer_service',
    name: 'Customer Service',
    prefix: 'B',
    description: 'Pembukaan rekening, informasi produk',
    icon: 'HeadphonesIcon',
    estimatedTime: 15,
  },
  {
    id: 'loan',
    name: 'Kredit/Pinjaman',
    prefix: 'C',
    description: 'Pengajuan kredit, konsultasi pinjaman',
    icon: 'FileText',
    estimatedTime: 30,
  },
];

export const getServiceTypeInfo = (type: ServiceType): ServiceTypeInfo => {
  return SERVICE_TYPES.find(s => s.id === type) || SERVICE_TYPES[0];
};
