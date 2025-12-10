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
import { postMapper } from './utils/post-mapper';
@Injectable()
export class PostService {
  constructor(
    @InjectRepository(UserPost)
    private readonly postRepo: Repository<UserPost>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async findOneInternal(id: number): Promise<UserPost> {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: this.getRelations(),
    });

    if (!post) {
      throw new NotFoundException(
        `No Post was found with the provided Post ID: ${id}`,
      );
    }

    return post;
  }

  async findOne(id: number): Promise<PostResponseDto> {
    const post = await this.findOneInternal(id);
    if (!post) {
      throw new NotFoundException(`No post found with the provided ID: ${id}`);
    }

    return postMapper(post);
  }

  async findByUserId(
    userId: number,
    page: number,
    limit: number,
  ): Promise<{ data: PostResponseDto[]; total: number }> {
    const [posts, total] = await this.postRepo.findAndCount({
      where: { creator: { id: userId } },
      relations: this.getRelations(),
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    const data = posts.map((p) => postMapper(p));
    return { data, total };
  }

  async create(dto: PostCreateDto): Promise<PostResponseDto> {
    const user = await this.userService.findOneInternal(dto.userId);
    const savedPost = await this.postRepo.save({ ...dto, creator: user });
    return await this.findOne(savedPost.id);
  }

  async update(
    id: number,
    userId: number,
    dto: PostUpdateDto,
  ): Promise<PostResponseDto> {
    const user = await this.userService.findOneInternal(userId);
    const existingPost = await this.findOneInternal(id);
    if (existingPost.creator.id !== user.id) {
      throw new UnauthorizedException('Only the creator can update the post');
    }

    const mergedPost = this.postRepo.merge(existingPost, dto);
    if (!mergedPost) {
      throw new Error(
        `Failed to merge post with provided data: ${JSON.stringify({ userId, ...dto })}`,
      );
    }

    const saved = await this.postRepo.save(mergedPost);
    return await this.findOne(saved.id);
  }

  async remove(id: number, userId: number): Promise<PostResponseDto> {
    const user = await this.userService.findOneInternal(userId);
    const existingPost = await this.findOneInternal(id);
    await this.userService.findOneInternal(userId);

    if (existingPost.creator.id !== user.id) {
      throw new UnauthorizedException(`Only creator user can remove the post`);
    }

    await this.postRepo.remove(existingPost);
    return postMapper(existingPost);
  }

  private getRelations() {
    return [
      'creator',
      'likes',
      'likes.user',
      'reactions',
      'reactions.user',
      'comments',
      'comments.user',
      'comments.post',
      'comments.parentComment',
      'comments.likes',
      'comments.likes.user',
      'comments.reactions',
      'comments.reactions.user',
    ];
  }
}
