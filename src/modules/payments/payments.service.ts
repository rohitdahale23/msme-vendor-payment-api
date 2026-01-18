import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Payment } from '../../database/entities/payment.entity';
import { PurchaseOrdersService } from '../purchase-orders/purchase-orders.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentFilterDto } from './dto/payment-filter.dto';
import { PaymentResponseDto, PaymentPODetailsDto } from './dto/payment-response.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly purchaseOrdersService: PurchaseOrdersService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<PaymentResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate purchase order exists
      const purchaseOrder = await this.purchaseOrdersService.findById(
        createPaymentDto.purchaseOrderId,
      );

      // Calculate outstanding amount
      const payments = await this.paymentRepository.find({
        where: { 
          purchaseOrderId: createPaymentDto.purchaseOrderId,
          deletedAt: null,
        },
      });

      const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const outstanding = Number(purchaseOrder.totalAmount) - totalPaid;

      // Validate payment amount
      if (createPaymentDto.amount <= 0) {
        throw new BadRequestException('Payment amount must be positive');
      }

      if (createPaymentDto.amount > outstanding) {
        throw new BadRequestException(
          `Payment amount (${createPaymentDto.amount}) exceeds outstanding amount (${outstanding})`,
        );
      }

      // Generate payment reference
      const paymentReference = await this.generatePaymentReference();

      // Create payment
      const payment = this.paymentRepository.create({
        paymentReference,
        purchaseOrderId: createPaymentDto.purchaseOrderId,
        paymentDate: createPaymentDto.paymentDate,
        amount: createPaymentDto.amount,
        paymentMethod: createPaymentDto.paymentMethod,
        notes: createPaymentDto.notes,
      });

      const savedPayment = await queryRunner.manager.save(payment);

      // Update PO status based on new payment
      await this.purchaseOrdersService.updatePOStatusBasedOnPayments(
        createPaymentDto.purchaseOrderId,
      );

      await queryRunner.commitTransaction();

      // Load with relations for response
      const paymentWithRelations = await this.paymentRepository.findOne({
        where: { id: savedPayment.id },
        relations: ['purchaseOrder', 'purchaseOrder.vendor'],
      });

      return this.mapToResponseDto(paymentWithRelations);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(filterDto: PaymentFilterDto): Promise<{ 
    data: PaymentResponseDto[]; 
    total: number; 
    page: number; 
    limit: number;
  }> {
    const { page = 1, limit = 20 } = filterDto;

    const skip = (page - 1) * limit;

    const [payments, total] = await this.paymentRepository.findAndCount({
      where: { deletedAt: null },
      relations: ['purchaseOrder', 'purchaseOrder.vendor'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const data = payments.map(payment => this.mapToResponseDto(payment));

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['purchaseOrder', 'purchaseOrder.vendor'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID '${id}' not found`);
    }

    return this.mapToResponseDto(payment);
  }

  async delete(id: string): Promise<{ message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const payment = await this.paymentRepository.findOne({
        where: { id, deletedAt: null },
      });

      if (!payment) {
        throw new NotFoundException(`Payment with ID '${id}' not found`);
      }

      // Soft delete the payment
      payment.deletedAt = new Date();
      await queryRunner.manager.save(payment);

      // Recalculate PO status after deletion
      await this.purchaseOrdersService.updatePOStatusBasedOnPayments(
        payment.purchaseOrderId,
      );

      await queryRunner.commitTransaction();

      return { message: `Payment ${payment.paymentReference} has been voided successfully` };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async generatePaymentReference(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    const count = await this.paymentRepository.count({
      where: {
        paymentReference: { $like: `PAY-${dateStr}-%` } as any,
      },
    });

    const sequence = String(count + 1).padStart(3, '0');
    return `PAY-${dateStr}-${sequence}`;
  }

  private mapToResponseDto(payment: Payment): PaymentResponseDto {
    const response: PaymentResponseDto = {
      id: payment.id,
      paymentReference: payment.paymentReference,
      purchaseOrderId: payment.purchaseOrderId,
      paymentDate: payment.paymentDate,
      amount: Number(payment.amount),
      paymentMethod: payment.paymentMethod,
      notes: payment.notes,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };

    if (payment.purchaseOrder) {
      response.purchaseOrder = {
        id: payment.purchaseOrder.id,
        poNumber: payment.purchaseOrder.poNumber,
        vendorName: payment.purchaseOrder.vendor.name,
        totalAmount: Number(payment.purchaseOrder.totalAmount),
      };
    }

    return response;
  }
}
