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
import { Technology } from './entities/technology.entity';
import { TechnologiesService } from './technologies.service';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';
import { JwtAuthGuard } from '../../@common/guards/jwt-auth.guard';
import { ReorderTechnologyDto } from './dto/reorder-technology.dto';
import { TechnologiesStatsDto } from './dto/technologies-stats.dto';
import { CreateTechnologyUseCase } from './use-cases/create-technology.use-case';
import { DeleteTechnologyUseCase } from './use-cases/delete-technology.use-case';
import { UpdateTechnologyUseCase } from './use-cases/update-technology.use-case';
import { ReorderTechnologyUseCase } from './use-cases/reorder-technology.use-case';
import { PaginationDto, PaginatedResponseDto } from '../../@common/dto/pagination.dto';
import { TechnologyNotFoundException } from './exceptions/technology-not-found.exception';
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TechnologyAlreadyExistsException } from './exceptions/technology-already-exists.exception';
import { TechnologyAlreadyDeletedException } from './exceptions/technology-already-deleted.exception';
import { ApiExceptionResponse } from '../../@common/decorators/documentation/api-exception-response.decorator';

@ApiBearerAuth()
@Controller(':username/technologies')
@ApiTags('Administration Technologies')
export class TechnologiesController {
    constructor(
        private readonly technologiesService: TechnologiesService,
        private readonly createTechnologyUseCase: CreateTechnologyUseCase,
        private readonly deleteTechnologyUseCase: DeleteTechnologyUseCase,
        private readonly updateTechnologyUseCase: UpdateTechnologyUseCase,
        private readonly reorderTechnologyUseCase: ReorderTechnologyUseCase,
    ) { }

    @Get()
    @ApiOkResponse({ type: () => PaginatedResponseDto<Technology> })
    async findAll(
        @Param('username') username: string,
        @Query() paginationDto: PaginationDto,
    ): Promise<PaginatedResponseDto<Technology>> {
        return await this.technologiesService.findAll(username, paginationDto);
    }

    @Get(':id')
    @ApiOkResponse({ type: () => Technology })
    @ApiExceptionResponse(() => TechnologyNotFoundException)
    async findById(
        @Param('username') username: string,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<Technology> {
        return await this.technologiesService.findById(id, username);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiOkResponse({ type: () => Technology })
    @ApiExceptionResponse(() => [
        TechnologyNotFoundException,
        TechnologyAlreadyExistsException,
    ])
    async create(
        @Param('username') username: string,
        @Body() createTechnologyDto: CreateTechnologyDto,
    ): Promise<Technology> {
        return await this.createTechnologyUseCase.execute(username, createTechnologyDto);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOkResponse({ type: () => Technology })
    @ApiExceptionResponse(() => [
        TechnologyNotFoundException,
        TechnologyAlreadyExistsException,
    ])
    async update(
        @Param('username') username: string,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateTechnologyDto: UpdateTechnologyDto,
    ): Promise<Technology> {
        return await this.updateTechnologyUseCase.execute(id, username, updateTechnologyDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard)
    @ApiNoContentResponse()
    @ApiExceptionResponse(() => [
        TechnologyNotFoundException,
        TechnologyAlreadyDeletedException,
    ])
    async delete(
        @Param('username') username: string,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
        return await this.deleteTechnologyUseCase.execute(username, id);
    }

    @Get('stats')
    @ApiOkResponse({ type: () => TechnologiesStatsDto })
    async getStats(
        @Param('username') username: string,
    ): Promise<TechnologiesStatsDto> {
        return await this.technologiesService.getStats(username);
    }

    @Put(':id/reorder')
    @UseGuards(JwtAuthGuard)
    @ApiOkResponse({ type: () => Technology })
    @ApiExceptionResponse(() => [TechnologyNotFoundException])
    async reorder(
        @Param('username') username: string,
        @Param('id', ParseIntPipe) id: number,
        @Body() reorderTechnologyDto: ReorderTechnologyDto,
    ): Promise<Technology> {
        return await this.reorderTechnologyUseCase.execute(username, id, reorderTechnologyDto);
    }
};
