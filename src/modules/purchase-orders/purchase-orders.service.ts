import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder, POStatus } from '../../database/entities/purchase-order.entity';
import { PurchaseOrderItem } from '../../database/entities/purchase-order-item.entity';
import { VendorStatus } from '../../database/entities/vendor.entity';
import { VendorsService } from '../vendors/vendors.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePOStatusDto } from './dto/update-po-status.dto';
import { POFilterDto } from './dto/po-filter.dto';
import { POResponseDto, POItemResponseDto, PaymentHistoryDto } from './dto/po-response.dto';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly poRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private readonly poItemRepository: Repository<PurchaseOrderItem>,
    private readonly vendorsService: VendorsService,
  ) {}

  async create(createPODto: CreatePurchaseOrderDto): Promise<POResponseDto> {
    // Validate vendor exists and is active
    const vendor = await this.vendorsService.findById(createPODto.vendorId);
    
    if (vendor.status === VendorStatus.INACTIVE) {
      throw new BadRequestException(`Cannot create purchase order for inactive vendor '${vendor.name}'`);
    }

    // Generate PO number
    const poNumber = await this.generatePONumber();

    // Calculate total amount and prepare items
    let totalAmount = 0;
    const items = createPODto.items.map(item => {
      const lineTotal = Number(item.quantity) * Number(item.unitPrice);
      totalAmount += lineTotal;

      const poItem = new PurchaseOrderItem();
      poItem.description = item.description;
      poItem.quantity = Number(item.quantity);
      poItem.unitPrice = Number(item.unitPrice);
      poItem.lineTotal = lineTotal;

      return poItem;
    });

    // Calculate due date based on vendor payment terms
    const poDate = new Date(createPODto.poDate);
    const dueDate = new Date(poDate);
    dueDate.setDate(dueDate.getDate() + vendor.paymentTerms);

    // Create purchase order
    const purchaseOrder = this.poRepository.create({
      poNumber,
      vendorId: createPODto.vendorId,
      poDate: createPODto.poDate,
      totalAmount,
      dueDate,
      status: createPODto.status || POStatus.DRAFT,
      items,
    });

    const savedPO = await this.poRepository.save(purchaseOrder);
    
    // Load with relations for response
    const poWithRelations = await this.poRepository.findOne({
      where: { id: savedPO.id },
      relations: ['vendor', 'items'],
    });

    return this.mapToResponseDto(poWithRelations);
  }

  async findAll(filterDto: POFilterDto): Promise<{ data: POResponseDto[]; total: number; page: number; limit: number }> {
    const { vendorId, status, page = 1, limit = 20 } = filterDto;

    const queryBuilder = this.poRepository.createQueryBuilder('po')
      .leftJoinAndSelect('po.vendor', 'vendor')
      .leftJoinAndSelect('po.items', 'items')
      .where('po.deletedAt IS NULL');

    if (vendorId) {
      queryBuilder.andWhere('po.vendorId = :vendorId', { vendorId });
    }

    if (status) {
      queryBuilder.andWhere('po.status = :status', { status });
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit).orderBy('po.createdAt', 'DESC');

    const [purchaseOrders, total] = await queryBuilder.getManyAndCount();

    const data = purchaseOrders.map(po => this.mapToResponseDto(po));

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<POResponseDto> {
    const purchaseOrder = await this.poRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['vendor', 'items', 'payments'],
    });

    if (!purchaseOrder) {
      throw new NotFoundException(`Purchase Order with ID '${id}' not found`);
    }

    return this.mapToResponseDto(purchaseOrder, true);
  }

  async updateStatus(id: string, updateStatusDto: UpdatePOStatusDto): Promise<POResponseDto> {
    const purchaseOrder = await this.poRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['vendor', 'items'],
    });

    if (!purchaseOrder) {
      throw new NotFoundException(`Purchase Order with ID '${id}' not found`);
    }

    // Validate status transition
    this.validateStatusTransition(purchaseOrder.status, updateStatusDto.status);

    purchaseOrder.status = updateStatusDto.status;
    const updatedPO = await this.poRepository.save(purchaseOrder);

    return this.mapToResponseDto(updatedPO);
  }

  async updatePOStatusBasedOnPayments(poId: string): Promise<void> {
    const purchaseOrder = await this.poRepository.findOne({
      where: { id: poId },
      relations: ['payments'],
    });

    if (!purchaseOrder) {
      throw new NotFoundException(`Purchase Order with ID '${poId}' not found`);
    }

    const totalPaid = purchaseOrder.payments
      .filter(p => !p.deletedAt)
      .reduce((sum, payment) => sum + Number(payment.amount), 0);

    const totalAmount = Number(purchaseOrder.totalAmount);

    if (totalPaid >= totalAmount) {
      purchaseOrder.status = POStatus.FULLY_PAID;
    } else if (totalPaid > 0) {
      purchaseOrder.status = POStatus.PARTIALLY_PAID;
    }

    await this.poRepository.save(purchaseOrder);
  }

  async findById(id: string): Promise<PurchaseOrder> {
    const purchaseOrder = await this.poRepository.findOne({
      where: { id, deletedAt: null },
    });

    if (!purchaseOrder) {
      throw new NotFoundException(`Purchase Order with ID '${id}' not found`);
    }

    return purchaseOrder;
  }

  private async generatePONumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    const count = await this.poRepository.count({
      where: {
        poNumber: { $like: `PO-${dateStr}-%` } as any,
      },
    });

    const sequence = String(count + 1).padStart(3, '0');
    return `PO-${dateStr}-${sequence}`;
  }

  private validateStatusTransition(currentStatus: POStatus, newStatus: POStatus): void {
    const validTransitions: Record<POStatus, POStatus[]> = {
      [POStatus.DRAFT]: [POStatus.APPROVED],
      [POStatus.APPROVED]: [POStatus.PARTIALLY_PAID, POStatus.FULLY_PAID],
      [POStatus.PARTIALLY_PAID]: [POStatus.FULLY_PAID],
      [POStatus.FULLY_PAID]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  private mapToResponseDto(po: PurchaseOrder, includePayments = false): POResponseDto {
    const response: POResponseDto = {
      id: po.id,
      poNumber: po.poNumber,
      vendorId: po.vendorId,
      vendorName: po.vendor.name,
      poDate: po.poDate,
      totalAmount: Number(po.totalAmount),
      dueDate: po.dueDate,
      status: po.status,
      items: po.items.map(item => this.mapItemToDto(item)),
      createdAt: po.createdAt,
      updatedAt: po.updatedAt,
    };

    if (includePayments && po.payments) {
      const payments = po.payments
        .filter(p => !p.deletedAt)
        .map(p => this.mapPaymentToDto(p));
      
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

      response.payments = payments;
      response.totalPaid = totalPaid;
      response.outstanding = Number(po.totalAmount) - totalPaid;
    }

    return response;
  }

  private mapItemToDto(item: PurchaseOrderItem): POItemResponseDto {
    return {
      id: item.id,
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.lineTotal),
    };
  }

  private mapPaymentToDto(payment: any): PaymentHistoryDto {
    return {
      id: payment.id,
      paymentReference: payment.paymentReference,
      paymentDate: payment.paymentDate,
      amount: Number(payment.amount),
      paymentMethod: payment.paymentMethod,
    };
  }
}
