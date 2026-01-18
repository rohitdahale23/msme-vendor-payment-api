import { Controller, Get, Post, Body, Delete, Param, Query, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentFilterDto } from './dto/payment-filter.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record a payment against a purchase order' })
  @ApiResponse({ status: 201, description: 'Payment recorded successfully', type: PaymentResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error or payment exceeds outstanding amount' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  async create(@Body() createPaymentDto: CreatePaymentDto): Promise<PaymentResponseDto> {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments with pagination' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  async findAll(@Query() filterDto: PaymentFilterDto) {
    return this.paymentsService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment details' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully', type: PaymentResponseDto })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PaymentResponseDto> {
    return this.paymentsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Void a payment (soft delete)' })
  @ApiResponse({ status: 200, description: 'Payment voided successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.delete(id);
  }
}
