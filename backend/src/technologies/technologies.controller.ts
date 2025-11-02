import {
    Get,
    Put,
    Post,
    Body,
    Param,
    Query,
    Delete,
    HttpCode,
    UseGuards,
    Controller,
    HttpStatus,
    ParseIntPipe,
} from '@nestjs/common';
import { FindManyOptions } from 'typeorm';
import { Technology } from './entities/technology.entity';
import { TechnologiesService } from './technologies.service';
import { JwtAuthGuard } from '../@common/guards/jwt-auth.guard';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';
import { QueryTechnologyDto } from './dto/query-technology.dto';
import { ReorderTechnologyDto } from './dto/reorder-technology.dto';
import { ApiNoContentResponse, ApiOkResponse } from '@nestjs/swagger';
import { ParseQuery } from '../@common/decorators/query/parse-query.decorator';
import { CreateTechnologyUseCase } from './use-cases/create-technology.use-case';
import { DeleteTechnologyUseCase } from './use-cases/delete-technology.use-case';
import { UpdateTechnologyUseCase } from './use-cases/update-technology.use-case';
import { ReorderTechnologyUseCase } from './use-cases/reorder-technology.use-case';
import { PaginationDto, PaginatedResponseDto } from '../@common/dto/pagination.dto';
import { TechnologyNotFoundException } from './exceptions/technology-not-found.exception';
import { TechnologyAlreadyExistsException } from './exceptions/technology-already-exists.exception';
import { TechnologyAlreadyDeletedException } from './exceptions/technology-already-deleted.exception';
import { ApiExceptionResponse } from '../@common/decorators/documentation/api-exception-response.decorator';

@Controller('technologies')
export class TechnologiesController {
    constructor(
        private readonly technologiesService: TechnologiesService,
        private readonly createTechnologyUseCase: CreateTechnologyUseCase,
        private readonly updateTechnologyUseCase: UpdateTechnologyUseCase,
        private readonly deleteTechnologyUseCase: DeleteTechnologyUseCase,
        private readonly reorderTechnologyUseCase: ReorderTechnologyUseCase,
    ) { }

    @Get()
    @ApiOkResponse({ type: () => Technology, isArray: true })
    async findAll(@ParseQuery() options: FindManyOptions<Technology>) {
        return await this.technologiesService.findAll(options);
    }

    @Get('paginated')
    @ApiOkResponse({ type: () => PaginatedResponseDto<Technology> })
    async findAllPaginated(
        @Query() paginationDto: PaginationDto,
    ): Promise<PaginatedResponseDto<Technology>> {
        return await this.technologiesService.findAllPaginated(paginationDto);
    }

    @Get('query')
    @ApiOkResponse({ type: () => PaginatedResponseDto<Technology> })
    async findAllByQuery(
        @Query() queryDto: QueryTechnologyDto,
    ): Promise<PaginatedResponseDto<Technology>> {
        return await this.technologiesService.findAllByQuery(queryDto);
    }

    @Get('stats')
    @ApiOkResponse({
        schema: {
            type: 'object',
            properties: {
                active: { type: 'number' },
                inactive: { type: 'number' },
                total: { type: 'number' },
            },
        },
    })
    async getStats(): Promise<{ active: number; inactive: number; total: number }> {
        return await this.technologiesService.getStats();
    }

    @Get(':id')
    @ApiOkResponse({ type: () => Technology })
    @ApiExceptionResponse(() => TechnologyNotFoundException)
    async findById(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<Technology> {
        return await this.technologiesService.findById(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiOkResponse({ type: () => Technology })
    @ApiExceptionResponse(() => [
        TechnologyNotFoundException,
        TechnologyAlreadyExistsException,
    ])
    async create(
        @Body() createTechnologyDto: CreateTechnologyDto,
    ): Promise<Technology> {
        return await this.createTechnologyUseCase.execute(createTechnologyDto);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOkResponse({ type: () => Technology })
    @ApiExceptionResponse(() => [
        TechnologyNotFoundException,
        TechnologyAlreadyExistsException,
    ])
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateTechnologyDto: UpdateTechnologyDto,
    ): Promise<Technology> {
        return await this.updateTechnologyUseCase.execute(id, updateTechnologyDto);
    }

    @Put(':id/reorder')
    @UseGuards(JwtAuthGuard)
    @ApiOkResponse({ type: () => Technology })
    @ApiExceptionResponse(() => [TechnologyNotFoundException])
    async reorder(
        @Param('id', ParseIntPipe) id: number,
        @Body() reorderTechnologyDto: ReorderTechnologyDto,
    ): Promise<Technology> {
        return await this.reorderTechnologyUseCase.execute(id, reorderTechnologyDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard)
    @ApiNoContentResponse()
    @ApiExceptionResponse(() => [
        TechnologyNotFoundException,
        TechnologyAlreadyDeletedException,
    ])
    async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return await this.deleteTechnologyUseCase.execute(id);
    }
}

