import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Content } from './entity/content.entity';
import { ContentCreateDto } from './dto/content-create.dto';
import { Message } from 'src/message/entities/message.entity';
import { MessageService } from 'src/message/message.service';
import { UserPost } from 'src/post/entities/user-post.entity';
import { PostService } from 'src/post/post.service';
import { ContentResponseDto } from './dto';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content)
    private readonly contentRepo: Repository<Content>,
    @Inject(forwardRef(() => MessageService))
    private readonly messageService: MessageService,
    @Inject(forwardRef(() => PostService))
    private readonly postService: PostService,
  ) {}

  async findOneInternal(id: number): Promise<Content> {
    const content = await this.contentRepo.findOne({
      where: { id },
      relations: ['post', 'post.creator', 'message', 'message.sender'],
    });

    if (!content) {
      throw new NotFoundException(
        `No content found with the provided Content ID: ${id}`,
      );
    }

    return content;
  }

  async findOne(id: number): Promise<ContentResponseDto> {
    const content = await this.contentRepo.findOne({
      where: { id },
    });

    if (!content) {
      throw new NotFoundException(
        `No content found with the provided Content ID: ${id}`,
      );
    }

    return this.toResponseDto(content);
  }

  async getFileData(id: number): Promise<ContentResponseDto> {
    const content = await this.contentRepo.findOne({
      where: { id },
    });

    if (!content) {
      throw new NotFoundException(`Content ${id} not found`);
    }

    return this.toResponseDto(content);
  }

  async create(dto: ContentCreateDto): Promise<Content> {
    let message: Message | null = null;
    if (dto.messageId) {
      message = await this.messageService.findOne(dto.messageId);
    }

    let post: UserPost | null = null;
    if (dto.postId) {
      post = await this.postService.findOneInternal(dto.postId);
    }

    return await this.contentRepo.save({
      type: dto.type,
      data: dto.data,
      message,
      post,
    } as DeepPartial<Content>);
  }

  async remove(id: number, userId: number): Promise<Content> {
    const content = await this.findOneInternal(id);
    const ownerId = content.post?.creator?.id || content.message?.sender?.id;

    if (ownerId !== userId) {
      throw new UnauthorizedException(
        'You do not have permission to perform this action.',
      );
    }

    return await this.contentRepo.remove(content);
  }

  toResponseDto(content: Content): ContentResponseDto {
    return new ContentResponseDto({
      id: content.id,
      type: content.type,
      url: `/content/${content.id}/file`,
    });
  }
}
