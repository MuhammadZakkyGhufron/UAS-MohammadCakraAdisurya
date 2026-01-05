import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { QueueTicket, Counter, ServiceType, QueueStats, getServiceTypeInfo } from '@/types/queue';

interface QueueContextType {
  tickets: QueueTicket[];
  counters: Counter[];
  todayStats: QueueStats;
  
  // Customer actions
  takeTicket: (serviceType: ServiceType) => QueueTicket;
  
  // Officer actions
  callNext: (counterId: number) => QueueTicket | null;
  completeService: (counterId: number) => void;
  skipTicket: (counterId: number) => void;
  
  // Admin actions
  setCounterActive: (counterId: number, isActive: boolean) => void;
  setOfficerName: (counterId: number, name: string) => void;
  resetQueue: () => void;
  
  // Getters
  getWaitingCount: (serviceType?: ServiceType) => number;
  getCurrentServing: () => QueueTicket[];
  getWaitingTickets: (serviceType?: ServiceType) => QueueTicket[];
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

const INITIAL_COUNTERS: Counter[] = [
  { id: 1, name: 'Loket 1', serviceType: 'teller', isActive: true },
  { id: 2, name: 'Loket 2', serviceType: 'teller', isActive: true },
  { id: 3, name: 'Loket 3', serviceType: 'customer_service', isActive: true },
  { id: 4, name: 'Loket 4', serviceType: 'customer_service', isActive: false },
  { id: 5, name: 'Loket 5', serviceType: 'loan', isActive: true },
];

const getInitialStats = (): QueueStats => ({
  date: new Date().toISOString().split('T')[0],
  totalServed: 0,
  totalSkipped: 0,
  averageWaitTime: 0,
  averageServiceTime: 0,
  byService: {
    teller: { total: 0, served: 0, skipped: 0, avgWaitTime: 0 },
    customer_service: { total: 0, served: 0, skipped: 0, avgWaitTime: 0 },
    loan: { total: 0, served: 0, skipped: 0, avgWaitTime: 0 },
  },
  hourlyData: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 })),
});

export const QueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<QueueTicket[]>(() => {
    const saved = localStorage.getItem('queue_tickets');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((t: any) => ({
        ...t,
        createdAt: new Date(t.createdAt),
        calledAt: t.calledAt ? new Date(t.calledAt) : undefined,
        completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
      }));
    }
    return [];
  });

  const [counters, setCounters] = useState<Counter[]>(() => {
    const saved = localStorage.getItem('queue_counters');
    return saved ? JSON.parse(saved) : INITIAL_COUNTERS;
  });

  const [todayStats, setTodayStats] = useState<QueueStats>(() => {
    const saved = localStorage.getItem('queue_stats');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === new Date().toISOString().split('T')[0]) {
        return parsed;
      }
    }
    return getInitialStats();
  });

  const [ticketCounters, setTicketCounters] = useState<{ [key in ServiceType]: number }>(() => {
    const saved = localStorage.getItem('ticket_counters');
    return saved ? JSON.parse(saved) : { teller: 0, customer_service: 0, loan: 0 };
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('queue_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('queue_counters', JSON.stringify(counters));
  }, [counters]);

  useEffect(() => {
    localStorage.setItem('queue_stats', JSON.stringify(todayStats));
  }, [todayStats]);

  useEffect(() => {
    localStorage.setItem('ticket_counters', JSON.stringify(ticketCounters));
  }, [ticketCounters]);

  const takeTicket = useCallback((serviceType: ServiceType): QueueTicket => {
    const serviceInfo = getServiceTypeInfo(serviceType);
    const newCounter = ticketCounters[serviceType] + 1;
    
    setTicketCounters(prev => ({ ...prev, [serviceType]: newCounter }));
    
    const ticket: QueueTicket = {
      id: `${serviceType}-${Date.now()}`,
      number: newCounter,
      displayNumber: `${serviceInfo.prefix}${String(newCounter).padStart(3, '0')}`,
      serviceType,
      status: 'waiting',
      createdAt: new Date(),
    };
    
    setTickets(prev => [...prev, ticket]);
    
    setTodayStats(prev => ({
      ...prev,
      byService: {
        ...prev.byService,
        [serviceType]: {
          ...prev.byService[serviceType],
          total: prev.byService[serviceType].total + 1,
        },
      },
      hourlyData: prev.hourlyData.map(h => 
        h.hour === new Date().getHours() ? { ...h, count: h.count + 1 } : h
      ),
    }));
    
    return ticket;
  }, [ticketCounters]);

  const callNext = useCallback((counterId: number): QueueTicket | null => {
    const counter = counters.find(c => c.id === counterId);
    if (!counter || !counter.isActive) return null;

    const waitingTickets = tickets
      .filter(t => t.serviceType === counter.serviceType && t.status === 'waiting')
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    if (waitingTickets.length === 0) return null;

    const nextTicket = waitingTickets[0];
    const calledAt = new Date();

    setTickets(prev => prev.map(t => 
      t.id === nextTicket.id 
        ? { ...t, status: 'serving' as const, calledAt, counter: counterId }
        : t
    ));

    setCounters(prev => prev.map(c => 
      c.id === counterId 
        ? { ...c, currentTicket: { ...nextTicket, status: 'serving', calledAt, counter: counterId } }
        : c
    ));

    return { ...nextTicket, status: 'serving', calledAt, counter: counterId };
  }, [counters, tickets]);

  const completeService = useCallback((counterId: number) => {
    const counter = counters.find(c => c.id === counterId);
    if (!counter?.currentTicket) return;

    const ticket = counter.currentTicket;
    const completedAt = new Date();
    const waitTime = ticket.calledAt 
      ? (ticket.calledAt.getTime() - ticket.createdAt.getTime()) / 60000 
      : 0;
    const serviceTime = ticket.calledAt 
      ? (completedAt.getTime() - ticket.calledAt.getTime()) / 60000 
      : 0;

    setTickets(prev => prev.map(t => 
      t.id === ticket.id ? { ...t, status: 'completed' as const, completedAt } : t
    ));

    setCounters(prev => prev.map(c => 
      c.id === counterId ? { ...c, currentTicket: undefined } : c
    ));

    setTodayStats(prev => {
      const serviceStats = prev.byService[ticket.serviceType];
      const newServed = serviceStats.served + 1;
      const newAvgWait = (serviceStats.avgWaitTime * serviceStats.served + waitTime) / newServed;
      
      return {
        ...prev,
        totalServed: prev.totalServed + 1,
        averageWaitTime: (prev.averageWaitTime * prev.totalServed + waitTime) / (prev.totalServed + 1),
        averageServiceTime: (prev.averageServiceTime * prev.totalServed + serviceTime) / (prev.totalServed + 1),
        byService: {
          ...prev.byService,
          [ticket.serviceType]: {
            ...serviceStats,
            served: newServed,
            avgWaitTime: newAvgWait,
          },
        },
      };
    });
  }, [counters]);

  const skipTicket = useCallback((counterId: number) => {
    const counter = counters.find(c => c.id === counterId);
    if (!counter?.currentTicket) return;

    const ticket = counter.currentTicket;

    setTickets(prev => prev.map(t => 
      t.id === ticket.id ? { ...t, status: 'skipped' as const, completedAt: new Date() } : t
    ));

    setCounters(prev => prev.map(c => 
      c.id === counterId ? { ...c, currentTicket: undefined } : c
    ));

    setTodayStats(prev => ({
      ...prev,
      totalSkipped: prev.totalSkipped + 1,
      byService: {
        ...prev.byService,
        [ticket.serviceType]: {
          ...prev.byService[ticket.serviceType],
          skipped: prev.byService[ticket.serviceType].skipped + 1,
        },
      },
    }));
  }, [counters]);

  const setCounterActive = useCallback((counterId: number, isActive: boolean) => {
    setCounters(prev => prev.map(c => 
      c.id === counterId ? { ...c, isActive } : c
    ));
  }, []);

  const setOfficerName = useCallback((counterId: number, name: string) => {
    setCounters(prev => prev.map(c => 
      c.id === counterId ? { ...c, officerName: name } : c
    ));
  }, []);

  const resetQueue = useCallback(() => {
    setTickets([]);
    setCounters(INITIAL_COUNTERS);
    setTodayStats(getInitialStats());
    setTicketCounters({ teller: 0, customer_service: 0, loan: 0 });
  }, []);

  const getWaitingCount = useCallback((serviceType?: ServiceType): number => {
    return tickets.filter(t => 
      t.status === 'waiting' && (!serviceType || t.serviceType === serviceType)
    ).length;
  }, [tickets]);

  const getCurrentServing = useCallback((): QueueTicket[] => {
    return tickets.filter(t => t.status === 'serving');
  }, [tickets]);

  const getWaitingTickets = useCallback((serviceType?: ServiceType): QueueTicket[] => {
    return tickets
      .filter(t => t.status === 'waiting' && (!serviceType || t.serviceType === serviceType))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }, [tickets]);

  return (
    <QueueContext.Provider value={{
      tickets,
      counters,
      todayStats,
      takeTicket,
      callNext,
      completeService,
      skipTicket,
      setCounterActive,
      setOfficerName,
      resetQueue,
      getWaitingCount,
      getCurrentServing,
      getWaitingTickets,
    }}>
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (context === undefined) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
};
