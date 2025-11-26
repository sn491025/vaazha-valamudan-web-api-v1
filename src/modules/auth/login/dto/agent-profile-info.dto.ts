import { ApiProperty } from '@nestjs/swagger';

export class AgentProfileInfoDto {

  @ApiProperty({ description: 'Agent ID (UUID)' })
  agent_id: string;

  @ApiProperty({ description: 'Agent name' })
  agent_name: string;

  @ApiProperty({ description: 'Agent email' })
  agent_profile_name: string;

}