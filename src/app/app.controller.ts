import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { AppService } from './services/app.service';
import { ApiStandardResponses } from '../common';
import { HealthCheckResponseDto } from './dto';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiStandardResponses(HealthCheckResponseDto, {
    successStatus: 200,
    includeAuth: false
  })
  @Get()
  getHello(): Promise<HealthCheckResponseDto> {
    return this.appService.getHello();
  }

  @ApiExcludeEndpoint()
  @Get('health')
  healthCheck(): Promise<HealthCheckResponseDto> {
    return this.appService.healthCheck();
  }
}
