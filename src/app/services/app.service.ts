import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async getHello(): Promise<{
    message: string;
    timestamp: string;
    uptime: number;
  }> {
    return {
      message: 'API is running successfully',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  async healthCheck(): Promise<{
    message: string;
    timestamp: string;
    uptime: number;
  }> {
    return {
      message: 'Service is healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
