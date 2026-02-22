import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { SingboxService } from './singbox.service';
import { CreateSingboxDto } from './dto/create-singbox.dto';
import { UpdateSingboxDto } from './dto/update-singbox.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('singbox')
@Controller('singbox')
export class SingboxController {
  constructor(private readonly singboxService: SingboxService) {}

  @Get('config/:nodeId')
  @ApiOperation({ summary: 'Get Sing-box config for node' })
  @ApiResponse({ status: 200, description: 'Sing-box configuration.' })
  getConfig(@Param('nodeId') nodeId: string) {
    return this.singboxService.generateConfig(nodeId);
  }

  @Post('config/:nodeId')
  @ApiOperation({ summary: 'Generate and save Sing-box config for node' })
  @ApiResponse({ status: 201, description: 'Config generated successfully.' })
  generateConfig(@Param('nodeId') nodeId: string, @Body() configData: any) {
    return this.singboxService.generateAndSaveConfig(nodeId, configData);
  }

  @Get('subscriptions/:userId')
  @ApiOperation({ summary: 'Get subscription config for user' })
  @ApiResponse({ status: 200, description: 'Subscription configuration.' })
  getSubscription(@Param('userId') userId: string) {
    return this.singboxService.generateSubscription(userId);
  }

  @Post('restart/:nodeId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restart Sing-box service on node' })
  @ApiResponse({ status: 200, description: 'Service restarted successfully.' })
  restartService(@Param('nodeId') nodeId: string) {
    return this.singboxService.restartService(nodeId);
  }

  @Get('status/:nodeId')
  @ApiOperation({ summary: 'Get Sing-box service status' })
  @ApiResponse({ status: 200, description: 'Service status.' })
  getStatus(@Param('nodeId') nodeId: string) {
    return this.singboxService.getServiceStatus(nodeId);
  }
}
