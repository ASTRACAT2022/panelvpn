
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { CreateMonitoringDto } from './dto/create-monitoring.dto';
import { UpdateMonitoringDto } from './dto/update-monitoring.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('monitoring')
@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Post()
  @ApiOperation({ summary: 'Create monitoring record' })
  @ApiResponse({ status: 201, description: 'Monitoring record created successfully.' })
  create(@Body() createMonitoringDto: CreateMonitoringDto) {
    return this.monitoringService.create(createMonitoringDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get monitoring data' })
  @ApiResponse({ status: 200, description: 'Monitoring data.' })
  findAll(@Query('nodeId') nodeId?: string, @Query('userId') userId?: string) {
    return this.monitoringService.getMonitoringData({ nodeId, userId });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get system statistics' })
  @ApiResponse({ status: 200, description: 'System statistics.' })
  getStats() {
    return this.monitoringService.getSystemStats();
  }

  @Get('traffic')
  @ApiOperation({ summary: 'Get traffic statistics' })
  @ApiResponse({ status: 200, description: 'Traffic statistics.' })
  getTraffic(@Query('nodeId') nodeId?: string, @Query('userId') userId?: string) {
    return this.monitoringService.getTrafficStats({ nodeId, userId });
  }

  @Get('nodes')
  @ApiOperation({ summary: 'Get node health status' })
  @ApiResponse({ status: 200, description: 'Node health status.' })
  getNodeHealth() {
    return this.monitoringService.getNodeHealth();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get monitoring record by ID' })
  @ApiResponse({ status: 200, description: 'Monitoring record.' })
  @ApiResponse({ status: 404, description: 'Record not found.' })
  findOne(@Param('id') id: string) {
    return this.monitoringService.findOne(id);
  }
}
