import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { NodesService } from './nodes.service';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('nodes')
@Controller('nodes')
export class NodesController {
  constructor(private readonly nodesService: NodesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new node' })
  @ApiResponse({ status: 201, description: 'Node created successfully.' })
  create(@Body() createNodeDto: CreateNodeDto) {
    return this.nodesService.create(createNodeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all nodes' })
  @ApiResponse({ status: 200, description: 'List of all nodes.' })
  findAll() {
    return this.nodesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get node by ID' })
  @ApiResponse({ status: 200, description: 'Node details.' })
  @ApiResponse({ status: 404, description: 'Node not found.' })
  findOne(@Param('id') id: string) {
    return this.nodesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update node' })
  @ApiResponse({ status: 200, description: 'Node updated successfully.' })
  update(@Param('id') id: string, @Body() updateNodeDto: UpdateNodeDto) {
    return this.nodesService.update(id, updateNodeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete node' })
  @ApiResponse({ status: 204, description: 'Node deleted successfully.' })
  remove(@Param('id') id: string) {
    return this.nodesService.remove(id);
  }

  @Post('heartbeat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Node heartbeat endpoint' })
  @ApiResponse({ status: 200, description: 'Heartbeat received.' })
  heartbeat(@Body() heartbeatData: { node_id: string; status: string; timestamp: number; version?: string }) {
    return this.nodesService.handleHeartbeat(heartbeatData);
  }
}
