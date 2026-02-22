import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new subscription' })
  @ApiResponse({ status: 201, description: 'Subscription created successfully.' })
  create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all subscriptions' })
  @ApiResponse({ status: 200, description: 'List of all subscriptions.' })
  findAll() {
    return this.subscriptionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription by ID' })
  @ApiResponse({ status: 200, description: 'Subscription details.' })
  @ApiResponse({ status: 404, description: 'Subscription not found.' })
  findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user subscriptions' })
  @ApiResponse({ status: 200, description: 'User subscriptions.' })
  getUserSubscriptions(@Param('userId') userId: string) {
    return this.subscriptionsService.getUserSubscriptions(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update subscription' })
  @ApiResponse({ status: 200, description: 'Subscription updated successfully.' })
  update(@Param('id') id: string, @Body() updateSubscriptionDto: UpdateSubscriptionDto) {
    return this.subscriptionsService.update(id, updateSubscriptionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete subscription' })
  @ApiResponse({ status: 200, description: 'Subscription deleted successfully.' })
  remove(@Param('id') id: string) {
    return this.subscriptionsService.remove(id);
  }

  @Get('config/:subscriptionId')
  @ApiOperation({ summary: 'Get subscription configuration' })
  @ApiResponse({ status: 200, description: 'Subscription configuration.' })
  getConfig(@Param('subscriptionId') subscriptionId: string) {
    return this.subscriptionsService.getSubscriptionConfig(subscriptionId);
  }
}
