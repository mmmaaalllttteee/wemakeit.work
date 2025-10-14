import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Moodboard } from './entities/moodboard.entity';
import { MoodItem } from './entities/mood-item.entity';
import {
  CreateMoodboardDto,
  UpdateMoodboardDto,
  CreateMoodItemDto,
  UpdateMoodItemDto,
  BulkUpdateItemsDto,
  AddCommentDto,
  AddReactionDto,
} from './dto/moodboard.dto';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

@Injectable()
export class MoodboardService {
  constructor(
    @InjectRepository(Moodboard)
    private moodboardRepository: Repository<Moodboard>,
    @InjectRepository(MoodItem)
    private moodItemRepository: Repository<MoodItem>,
  ) {}

  // ==================== Moodboards ====================

  async createMoodboard(dto: CreateMoodboardDto, userId: string): Promise<Moodboard> {
    const moodboard = this.moodboardRepository.create({
      ...dto,
      createdBy: userId,
      settings: {
        backgroundColor: '#1a1a1a',
        gridEnabled: true,
        gridSize: 20,
        snapToGrid: false,
        zoom: 1,
        viewX: 0,
        viewY: 0,
        ...dto.settings,
      },
    });

    return await this.moodboardRepository.save(moodboard);
  }

  async getMoodboards(projectId: string): Promise<Moodboard[]> {
    return await this.moodboardRepository.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
    });
  }

  async getMoodboard(id: string): Promise<Moodboard> {
    const moodboard = await this.moodboardRepository.findOne({
      where: { id },
      relations: ['items', 'items.file', 'items.creator'],
    });

    if (!moodboard) {
      throw new NotFoundException('Moodboard not found');
    }

    return moodboard;
  }

  async updateMoodboard(id: string, dto: UpdateMoodboardDto, userId: string): Promise<Moodboard> {
    const moodboard = await this.moodboardRepository.findOne({ where: { id } });

    if (!moodboard) {
      throw new NotFoundException('Moodboard not found');
    }

    if (dto.settings) {
      moodboard.settings = { ...moodboard.settings, ...dto.settings };
    }

    Object.assign(moodboard, dto);

    return await this.moodboardRepository.save(moodboard);
  }

  async deleteMoodboard(id: string, userId: string): Promise<void> {
    const moodboard = await this.moodboardRepository.findOne({ where: { id } });

    if (!moodboard) {
      throw new NotFoundException('Moodboard not found');
    }

    if (moodboard.createdBy !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    await this.moodboardRepository.remove(moodboard);
  }

  // ==================== Mood Items ====================

  async createMoodItem(
    moodboardId: string,
    dto: CreateMoodItemDto,
    userId: string,
  ): Promise<MoodItem> {
    // Verify moodboard exists
    const moodboard = await this.moodboardRepository.findOne({ where: { id: moodboardId } });
    if (!moodboard) {
      throw new NotFoundException('Moodboard not found');
    }

    // Fetch oEmbed data for links
    if (dto.type === 'link' && dto.linkUrl) {
      try {
        const oEmbedData = await this.fetchOEmbedData(dto.linkUrl);
        dto.metadata = {
          ...dto.metadata,
          oEmbed: oEmbedData,
        };
      } catch (error) {
        console.error('Failed to fetch oEmbed data:', error);
      }
    }

    const item = this.moodItemRepository.create({
      ...dto,
      moodboardId,
      createdBy: userId,
      rotation: dto.rotation || 0,
      zIndex: dto.zIndex || 0,
      opacity: 1.0,
      comments: [],
      reactions: [],
    });

    return await this.moodItemRepository.save(item);
  }

  async getMoodItems(moodboardId: string): Promise<MoodItem[]> {
    return await this.moodItemRepository.find({
      where: { moodboardId },
      relations: ['file', 'creator'],
      order: { zIndex: 'ASC' },
    });
  }

  async updateMoodItem(id: string, dto: UpdateMoodItemDto, userId: string): Promise<MoodItem> {
    const item = await this.moodItemRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException('Mood item not found');
    }

    if (dto.metadata) {
      item.metadata = { ...item.metadata, ...dto.metadata };
    }

    Object.assign(item, dto);

    return await this.moodItemRepository.save(item);
  }

  async bulkUpdateMoodItems(
    moodboardId: string,
    dto: BulkUpdateItemsDto,
    userId: string,
  ): Promise<void> {
    const itemIds = Object.keys(dto.updates);
    const items = await this.moodItemRepository.find({
      where: { id: In(itemIds), moodboardId },
    });

    for (const item of items) {
      const updates = dto.updates[item.id];
      if (updates) {
        Object.assign(item, updates);
      }
    }

    await this.moodItemRepository.save(items);
  }

  async deleteMoodItem(id: string, userId: string): Promise<void> {
    const item = await this.moodItemRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException('Mood item not found');
    }

    // Allow deletion by creator or anyone with access (for now)
    await this.moodItemRepository.remove(item);
  }

  // ==================== Comments & Reactions ====================

  async addComment(
    itemId: string,
    dto: AddCommentDto,
    userId: string,
    userName: string,
  ): Promise<MoodItem> {
    const item = await this.moodItemRepository.findOne({ where: { id: itemId } });

    if (!item) {
      throw new NotFoundException('Mood item not found');
    }

    const comment = {
      id: uuidv4(),
      userId,
      userName,
      text: dto.text,
      createdAt: new Date(),
    };

    item.comments = [...(item.comments || []), comment];

    return await this.moodItemRepository.save(item);
  }

  async deleteComment(itemId: string, commentId: string, userId: string): Promise<MoodItem> {
    const item = await this.moodItemRepository.findOne({ where: { id: itemId } });

    if (!item) {
      throw new NotFoundException('Mood item not found');
    }

    item.comments = (item.comments || []).filter(
      (comment) => comment.id !== commentId || comment.userId === userId,
    );

    return await this.moodItemRepository.save(item);
  }

  async addReaction(
    itemId: string,
    dto: AddReactionDto,
    userId: string,
    userName: string,
  ): Promise<MoodItem> {
    const item = await this.moodItemRepository.findOne({ where: { id: itemId } });

    if (!item) {
      throw new NotFoundException('Mood item not found');
    }

    // Remove existing reaction from this user
    item.reactions = (item.reactions || []).filter((r) => r.userId !== userId);

    // Add new reaction
    item.reactions.push({
      emoji: dto.emoji,
      userId,
      userName,
    });

    return await this.moodItemRepository.save(item);
  }

  async removeReaction(itemId: string, userId: string): Promise<MoodItem> {
    const item = await this.moodItemRepository.findOne({ where: { id: itemId } });

    if (!item) {
      throw new NotFoundException('Mood item not found');
    }

    item.reactions = (item.reactions || []).filter((r) => r.userId !== userId);

    return await this.moodItemRepository.save(item);
  }

  // ==================== Utilities ====================

  private async fetchOEmbedData(url: string): Promise<any> {
    // Try common oEmbed endpoints
    const providers = [
      { pattern: /youtube\.com|youtu\.be/, endpoint: 'https://www.youtube.com/oembed' },
      { pattern: /vimeo\.com/, endpoint: 'https://vimeo.com/api/oembed.json' },
      { pattern: /spotify\.com/, endpoint: 'https://open.spotify.com/oembed' },
      { pattern: /soundcloud\.com/, endpoint: 'https://soundcloud.com/oembed' },
    ];

    for (const provider of providers) {
      if (provider.pattern.test(url)) {
        try {
          const response = await axios.get(provider.endpoint, {
            params: { url, format: 'json' },
            timeout: 5000,
          });
          return response.data;
        } catch (error) {
          console.error(
            `Failed to fetch oEmbed from ${provider.endpoint}:`,
            error instanceof Error ? error.message : 'Unknown error',
          );
        }
      }
    }

    // Fallback: basic URL preview
    return {
      title: url,
      provider: new URL(url).hostname,
    };
  }
}
