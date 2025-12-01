import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Content } from './entity/content.entity';
import { ContentCreateDto } from './dto/content-create.dto';
import { Message } from 'src/message/entities/message.entity';
import { MessageService } from 'src/message/message.service';
import { UserPost } from 'src/post/entities/user-post.entity';
import { PostService } from 'src/post/post.service';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content)
    private readonly contentRepo: Repository<Content>,
    private readonly messageService: MessageService,
    private readonly postService: PostService,
  ) {}

  async findOne(id: number): Promise<Content> {
    const content = await this.contentRepo.findOne({
      where: { id },
      relations: ['message', 'post'],
    });

    if (!content) {
      throw new NotFoundException(
        `No content found with the provided Content ID: ${id}`,
      );
    }

    return content;
  }

  async findAll() {
    return this.contentRepo.find({ relations: ['message', 'post'] });
  }

  async create(dto: ContentCreateDto): Promise<Content> {
    let message: Message | null = null;
    if (dto.messageId) {
      message = await this.messageService.findOne(dto.messageId);
    }

    let post: UserPost | null = null;
    if (dto.postId) {
      post = await this.postService.findOne(dto.postId);
    }

    return await this.contentRepo.save({
      type: dto.type,
      data: dto.data,
      message,
      post,
    } as DeepPartial<Content>);
  }

  async remove(id: number): Promise<Content> {
    const content = await this.findOne(id);
    await this.contentRepo.remove(content);
    return content;
  }
}
