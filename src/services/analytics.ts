export interface AnalyticsReport {
  events: AnalyticsEvent[];
  summary: {
    totalEvents: number;
    categoryCounts: Record<string, number>;
  };
}

export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: Date;
}

export class Analytics {
  private events: AnalyticsEvent[] = [];

  trackEvent(event: AnalyticsEvent): void {
    this.events.push(event);
  }

  generateReport(): AnalyticsReport {
    const categoryCounts = this.events.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      events: this.events,
      summary: {
        totalEvents: this.events.length,
        categoryCounts,
      },
    };
  }
}

export const analytics = new Analytics(); 