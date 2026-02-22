import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ClustersService } from './clusters.service';
import { CreateClusterDto } from './dto/create-cluster.dto';
import { UpdateClusterDto } from './dto/update-cluster.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('clusters')
@Controller('clusters')
export class ClustersController {
  constructor(private readonly clustersService: ClustersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new cluster' })
  @ApiResponse({ status: 201, description: 'Cluster created successfully.' })
  create(@Body() createClusterDto: CreateClusterDto) {
    return this.clustersService.create(createClusterDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all clusters' })
  @ApiResponse({ status: 200, description: 'List of all clusters.' })
  findAll() {
    return this.clustersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cluster by ID' })
  @ApiResponse({ status: 200, description: 'Cluster details.' })
  @ApiResponse({ status: 404, description: 'Cluster not found.' })
  findOne(@Param('id') id: string) {
    return this.clustersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update cluster' })
  @ApiResponse({ status: 200, description: 'Cluster updated successfully.' })
  update(@Param('id') id: string, @Body() updateClusterDto: UpdateClusterDto) {
    return this.clustersService.update(id, updateClusterDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete cluster' })
  @ApiResponse({ status: 204, description: 'Cluster deleted successfully.' })
  remove(@Param('id') id: string) {
    return this.clustersService.remove(id);
  }

  @Post(':id/nodes')
  @ApiOperation({ summary: 'Add node to cluster' })
  @ApiResponse({ status: 200, description: 'Node added to cluster successfully.' })
  addNode(@Param('id') clusterId: string, @Body() nodeData: { nodeId: string }) {
    return this.clustersService.addNode(clusterId, nodeData.nodeId);
  }

  @Delete(':id/nodes/:nodeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove node from cluster' })
  @ApiResponse({ status: 204, description: 'Node removed from cluster successfully.' })
  removeNode(@Param('id') clusterId: string, @Param('nodeId') nodeId: string) {
    return this.clustersService.removeNode(clusterId, nodeId);
  }
}
