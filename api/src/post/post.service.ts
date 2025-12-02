import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPost } from './entities/user-post.entity';
import { PostCreateDto, PostUpdateDto } from './dto';
import { UserService } from 'src/user/user.service';
import { ContentService } from 'src/content/content.service';
import { Content } from 'src/content/entity/content.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(UserPost)
    private readonly postRepo: Repository<UserPost>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => ContentService))
    private readonly contentService: ContentService,
  ) {}

  async findOne(id: number): Promise<UserPost> {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: [
        'creator',
        'likes',
        'reactions',
        'comments',
        'comments.user',
        'comments.likes',
        'comments.replies',
        'comments.replies.user',
        'comments.replies.likes',
      ],
    });

    if (!post) {
      throw new NotFoundException(
        `No Post was found with the provided Post ID: ${id}`,
      );
    }

    return post;
  }

  async findByUserId(userId: number): Promise<UserPost[]> {
    const posts = await this.postRepo.find({
      where: { creator: { id: userId } },
      relations: [
        'creator',
        'likes',
        'reactions',
        'comments',
        'comments.user',
        'comments.likes',
        'comments.replies',
        'comments.replies.user',
        'comments.replies.likes',
      ],
      order: { createdAt: 'ASC' },
    });

    if (posts.length === 0) {
      throw new NotFoundException(`No Posts found for User ID: ${userId}`);
    }

    return posts;
  }

  async findAll(): Promise<UserPost[]> {
    return await this.postRepo.find({
      relations: ['creator', 'likes', 'comments', 'reactions'],
      order: { createdAt: 'ASC' },
    });
  }

  async create(dto: PostCreateDto): Promise<UserPost> {
    const user = await this.userService.findOneInternal(dto.userId);
    const dataToSave = { ...dto, creator: user };
    if (dto.attachments) {
      const contentArray: Content[] = [];
      for (const a of dto.attachments) {
        const savedContent = await this.contentService.create(a);
        contentArray.push(savedContent);
      }

      dataToSave.attachments = contentArray;
    }
    return await this.postRepo.save(dataToSave);
  }

  async update(
    id: number,
    userId: number,
    dto: PostUpdateDto,
  ): Promise<UserPost> {
    await this.userService.findOneInternal(userId);
    const existingPost = await this.findOne(id);
    if (existingPost.creator.id !== userId) {
      throw new UnauthorizedException('Only the creator can update the post');
    }

    if (dto.attachments) {
      const contentArray: Content[] = [];
      for (const a of dto.attachments) {
        const savedContent = await this.contentService.create(a);
        contentArray.push(savedContent);
      }

      dto.attachments = contentArray;
    }

    const mergedPost = this.postRepo.merge(existingPost, dto);
    if (!mergedPost) {
      throw new Error(
        `Failed to merge post with provided data: ${JSON.stringify({ userId, ...dto })}`,
      );
    }
    return await this.postRepo.save(mergedPost);
  }

  async remove(id: number, userId: number): Promise<UserPost> {
    const existingPost = await this.findOne(id);
    await this.userService.findOneInternal(userId);

    if (existingPost.creator.id !== userId) {
      throw new UnauthorizedException(`Only creator user can remove the post`);
    }

    await this.postRepo.remove(existingPost);
    return existingPost;
  }
}
