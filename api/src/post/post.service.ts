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
import { PostCreateDto, PostResponseDto, PostUpdateDto } from './dto';
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

  async findOneInternal(id: number): Promise<UserPost> {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['creator', 'likes', 'reactions', 'comments', 'contents'],
    });

    if (!post) {
      throw new NotFoundException(
        `No Post was found with the provided Post ID: ${id}`,
      );
    }

    return post;
  }

  async findByUserId(userId: number): Promise<PostResponseDto[]> {
    const posts = await this.postRepo.find({
      where: { creator: { id: userId } },
      relations: ['creator', 'likes', 'reactions', 'comments', 'contents'],
      order: { createdAt: 'ASC' },
    });

    if (posts.length === 0) {
      throw new NotFoundException(`No Posts found for User ID: ${userId}`);
    }

    const responseDtos: PostResponseDto[] = [];
    for (const p of posts) {
      responseDtos.push(this.toResponseDto(p));
    }

    return responseDtos;
  }

  async create(dto: PostCreateDto): Promise<PostResponseDto> {
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

    const saved = await this.postRepo.save(dataToSave);
    return this.toResponseDto(saved);
  }

  async update(
    id: number,
    userId: number,
    dto: PostUpdateDto,
  ): Promise<PostResponseDto> {
    await this.userService.findOneInternal(userId);
    const existingPost = await this.findOneInternal(id);
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

    const saved = await this.postRepo.save(mergedPost);
    return this.toResponseDto(saved);
  }

  async remove(id: number, userId: number): Promise<PostResponseDto> {
    const existingPost = await this.findOneInternal(id);
    await this.userService.findOneInternal(userId);

    if (existingPost.creator.id !== userId) {
      throw new UnauthorizedException(`Only creator user can remove the post`);
    }

    await this.postRepo.remove(existingPost);
    return this.toResponseDto(existingPost);
  }

  toResponseDto(post: UserPost): PostResponseDto {
    return {
      id: post.id,
      title: post.title ?? '',
      textContent: post.textContent ?? '',
      createdAt: post.createdAt,
      creatorId: post.creator.id,

      contents:
        post.contents?.map((a) => this.contentService.toResponseDto(a)) ?? [],

      commentCount: post.comments?.length ?? 0,
      likeCount: post.likes?.length ?? 0,
      reactionCount: post.reactions?.length ?? 0,
    };
  }
}
