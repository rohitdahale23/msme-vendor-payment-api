import { Controller, Get, Post, Body, Put, Param, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { VendorResponseDto } from './dto/vendor-response.dto';

@ApiTags('Vendors')
@ApiBearerAuth()
@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new vendor' })
  @ApiResponse({ status: 201, description: 'Vendor created successfully', type: VendorResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Vendor already exists' })
  async create(@Body() createVendorDto: CreateVendorDto): Promise<VendorResponseDto> {
    return this.vendorsService.create(createVendorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vendors' })
  @ApiResponse({ status: 200, description: 'Vendors retrieved successfully', type: [VendorResponseDto] })
  async findAll(): Promise<VendorResponseDto[]> {
    return this.vendorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vendor details with payment summary' })
  @ApiResponse({ status: 200, description: 'Vendor retrieved successfully', type: VendorResponseDto })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<VendorResponseDto> {
    return this.vendorsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update vendor information' })
  @ApiResponse({ status: 200, description: 'Vendor updated successfully', type: VendorResponseDto })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  @ApiResponse({ status: 409, description: 'Vendor with name/email already exists' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVendorDto: UpdateVendorDto,
  ): Promise<VendorResponseDto> {
    return this.vendorsService.update(id, updateVendorDto);
  }
}
