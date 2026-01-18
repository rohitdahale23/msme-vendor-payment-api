import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from '../../database/entities/vendor.entity';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { VendorResponseDto, VendorPaymentSummary } from './dto/vendor-response.dto';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
  ) {}

  async create(createVendorDto: CreateVendorDto): Promise<VendorResponseDto> {
    // Check for unique name
    const existingByName = await this.vendorRepository.findOne({
      where: { name: createVendorDto.name, deletedAt: null },
    });
    if (existingByName) {
      throw new ConflictException(`Vendor with name '${createVendorDto.name}' already exists`);
    }

    // Check for unique email
    const existingByEmail = await this.vendorRepository.findOne({
      where: { email: createVendorDto.email, deletedAt: null },
    });
    if (existingByEmail) {
      throw new ConflictException(`Vendor with email '${createVendorDto.email}' already exists`);
    }

    const vendor = this.vendorRepository.create(createVendorDto);
    const savedVendor = await this.vendorRepository.save(vendor);

    return this.mapToResponseDto(savedVendor);
  }

  async findAll(): Promise<VendorResponseDto[]> {
    const vendors = await this.vendorRepository.find({
      where: { deletedAt: null },
      order: { createdAt: 'DESC' },
    });

    return vendors.map(vendor => this.mapToResponseDto(vendor));
  }

  async findOne(id: string): Promise<VendorResponseDto> {
    const vendor = await this.vendorRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['purchaseOrders', 'purchaseOrders.payments'],
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID '${id}' not found`);
    }

    return this.mapToResponseDto(vendor, true);
  }

  async update(id: string, updateVendorDto: UpdateVendorDto): Promise<VendorResponseDto> {
    const vendor = await this.vendorRepository.findOne({
      where: { id, deletedAt: null },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID '${id}' not found`);
    }

    // Check for unique name if updating
    if (updateVendorDto.name && updateVendorDto.name !== vendor.name) {
      const existingByName = await this.vendorRepository.findOne({
        where: { name: updateVendorDto.name, deletedAt: null },
      });
      if (existingByName) {
        throw new ConflictException(`Vendor with name '${updateVendorDto.name}' already exists`);
      }
    }

    // Check for unique email if updating
    if (updateVendorDto.email && updateVendorDto.email !== vendor.email) {
      const existingByEmail = await this.vendorRepository.findOne({
        where: { email: updateVendorDto.email, deletedAt: null },
      });
      if (existingByEmail) {
        throw new ConflictException(`Vendor with email '${updateVendorDto.email}' already exists`);
      }
    }

    Object.assign(vendor, updateVendorDto);
    const updatedVendor = await this.vendorRepository.save(vendor);

    return this.mapToResponseDto(updatedVendor);
  }

  private mapToResponseDto(vendor: Vendor, includePaymentSummary = false): VendorResponseDto {
    const response: VendorResponseDto = {
      id: vendor.id,
      name: vendor.name,
      contactPerson: vendor.contactPerson,
      email: vendor.email,
      phone: vendor.phone,
      paymentTerms: vendor.paymentTerms,
      status: vendor.status,
      createdAt: vendor.createdAt,
      updatedAt: vendor.updatedAt,
    };

    if (includePaymentSummary && vendor.purchaseOrders) {
      const summary = this.calculatePaymentSummary(vendor);
      response.paymentSummary = summary;
    }

    return response;
  }

  private calculatePaymentSummary(vendor: Vendor): VendorPaymentSummary {
    let totalAmount = 0;
    let totalPaid = 0;

    vendor.purchaseOrders.forEach(po => {
      totalAmount += Number(po.totalAmount);
      
      if (po.payments) {
        po.payments.forEach(payment => {
          if (!payment.deletedAt) {
            totalPaid += Number(payment.amount);
          }
        });
      }
    });

    return {
      totalPurchaseOrders: vendor.purchaseOrders.length,
      totalAmount,
      totalPaid,
      outstanding: totalAmount - totalPaid,
    };
  }

  async findById(id: string): Promise<Vendor> {
    const vendor = await this.vendorRepository.findOne({
      where: { id, deletedAt: null },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID '${id}' not found`);
    }

    return vendor;
  }
}