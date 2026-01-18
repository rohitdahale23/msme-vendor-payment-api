import { Controller, Get, Post, Body, Patch, Param, Query, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePOStatusDto } from './dto/update-po-status.dto';
import { POFilterDto } from './dto/po-filter.dto';
import { POResponseDto } from './dto/po-response.dto';

@ApiTags('Purchase Orders')
@ApiBearerAuth()
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new purchase order' })
  @ApiResponse({ status: 201, description: 'Purchase order created successfully', type: POResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error or inactive vendor' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async create(@Body() createPODto: CreatePurchaseOrderDto): Promise<POResponseDto> {
    return this.purchaseOrdersService.create(createPODto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all purchase orders with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Purchase orders retrieved successfully' })
  async findAll(@Query() filterDto: POFilterDto) {
    return this.purchaseOrdersService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase order details with payment history' })
  @ApiResponse({ status: 200, description: 'Purchase order retrieved successfully', type: POResponseDto })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<POResponseDto> {
    return this.purchaseOrdersService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update purchase order status' })
  @ApiResponse({ status: 200, description: 'Purchase order status updated successfully', type: POResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdatePOStatusDto,
  ): Promise<POResponseDto> {
    return this.purchaseOrdersService.updateStatus(id, updateStatusDto);
  }
}
