import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MoodboardService } from './moodboard.service';
import {
  CreateMoodboardDto,
  UpdateMoodboardDto,
  CreateMoodItemDto,
  UpdateMoodItemDto,
  BulkUpdateItemsDto,
  AddCommentDto,
  AddReactionDto,
} from './dto/moodboard.dto';

@ApiTags('Moodboards')
@ApiBearerAuth()
@Controller('moodboards')
@UseGuards(JwtAuthGuard)
export class MoodboardController {
  constructor(private readonly moodboardService: MoodboardService) {}

  // ==================== Moodboards ====================

  @Post()
  @ApiOperation({ summary: 'Create a new moodboard' })
  async createMoodboard(@Body() dto: CreateMoodboardDto, @Request() req) {
    return this.moodboardService.createMoodboard(dto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all moodboards for a project' })
  async getMoodboards(@Query('projectId') projectId: string) {
    return this.moodboardService.getMoodboards(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single moodboard with all items' })
  async getMoodboard(@Param('id') id: string) {
    return this.moodboardService.getMoodboard(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update moodboard settings' })
  async updateMoodboard(@Param('id') id: string, @Body() dto: UpdateMoodboardDto, @Request() req) {
    return this.moodboardService.updateMoodboard(id, dto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a moodboard' })
  async deleteMoodboard(@Param('id') id: string, @Request() req) {
    await this.moodboardService.deleteMoodboard(id, req.user.userId);
    return { message: 'Moodboard deleted successfully' };
  }

  // ==================== Mood Items ====================

  @Post(':id/items')
  @ApiOperation({ summary: 'Add an item to a moodboard' })
  async createMoodItem(
    @Param('id') moodboardId: string,
    @Body() dto: CreateMoodItemDto,
    @Request() req,
  ) {
    return this.moodboardService.createMoodItem(moodboardId, dto, req.user.userId);
  }

  @Get(':id/items')
  @ApiOperation({ summary: 'Get all items for a moodboard' })
  async getMoodItems(@Param('id') moodboardId: string) {
    return this.moodboardService.getMoodItems(moodboardId);
  }

  @Patch(':id/items/:itemId')
  @ApiOperation({ summary: 'Update a single mood item' })
  async updateMoodItem(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateMoodItemDto,
    @Request() req,
  ) {
    return this.moodboardService.updateMoodItem(itemId, dto, req.user.userId);
  }

  @Post(':id/items/bulk')
  @ApiOperation({ summary: 'Bulk update multiple items (for drag operations)' })
  async bulkUpdateMoodItems(
    @Param('id') moodboardId: string,
    @Body() dto: BulkUpdateItemsDto,
    @Request() req,
  ) {
    await this.moodboardService.bulkUpdateMoodItems(moodboardId, dto, req.user.userId);
    return { message: 'Items updated successfully' };
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Delete a mood item' })
  async deleteMoodItem(@Param('id') id: string, @Request() req) {
    await this.moodboardService.deleteMoodItem(id, req.user.userId);
    return { message: 'Item deleted successfully' };
  }

  // ==================== Comments & Reactions ====================

  @Post('items/:id/comments')
  @ApiOperation({ summary: 'Add a comment to an item' })
  async addComment(@Param('id') itemId: string, @Body() dto: AddCommentDto, @Request() req) {
    return this.moodboardService.addComment(
      itemId,
      dto,
      req.user.userId,
      req.user.name || req.user.email,
    );
  }

  @Delete('items/:id/comments/:commentId')
  @ApiOperation({ summary: 'Delete a comment' })
  async deleteComment(
    @Param('id') itemId: string,
    @Param('commentId') commentId: string,
    @Request() req,
  ) {
    return this.moodboardService.deleteComment(itemId, commentId, req.user.userId);
  }

  @Post('items/:id/reactions')
  @ApiOperation({ summary: 'Add or update a reaction to an item' })
  async addReaction(@Param('id') itemId: string, @Body() dto: AddReactionDto, @Request() req) {
    return this.moodboardService.addReaction(
      itemId,
      dto,
      req.user.userId,
      req.user.name || req.user.email,
    );
  }

  @Delete('items/:id/reactions')
  @ApiOperation({ summary: 'Remove your reaction from an item' })
  async removeReaction(@Param('id') itemId: string, @Request() req) {
    return this.moodboardService.removeReaction(itemId, req.user.userId);
  }
}
