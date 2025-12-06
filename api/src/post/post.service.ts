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
import { convertToResponseDto } from 'src/common/utils';
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
      relations: ['creator', 'likes', 'reactions', 'comments'],
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

    return convertToResponseDto(PostResponseDto, {
      ...post,
      creatorId: post.creator.id,
    });
  }

  async findByUserId(userId: number): Promise<PostResponseDto[]> {
    const posts = await this.postRepo.find({
      where: { creator: { id: userId } },
      relations: ['creator', 'likes', 'reactions', 'comments'],
      order: { createdAt: 'DESC' },
    });

    return posts.map((p) =>
      convertToResponseDto(PostResponseDto, {
        ...p,
        creatorId: p.creator.id,
      }),
    );
  }

  async create(dto: PostCreateDto): Promise<PostResponseDto> {
    const user = await this.userService.findOneInternal(dto.userId);
    const savedPost = await this.postRepo.save({ ...dto, creator: user });
    return convertToResponseDto(PostResponseDto, {
      ...savedPost,
      creatorId: dto.userId,
    });
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

    const mergedPost = this.postRepo.merge(existingPost, dto);
    if (!mergedPost) {
      throw new Error(
        `Failed to merge post with provided data: ${JSON.stringify({ userId, ...dto })}`,
      );
    }

    const saved = await this.postRepo.save(mergedPost);
    return convertToResponseDto(PostResponseDto, {
      ...saved,
      creatorId: userId,
    });
  }

  async remove(id: number, userId: number): Promise<PostResponseDto> {
    const existingPost = await this.findOneInternal(id);
    await this.userService.findOneInternal(userId);

    if (existingPost.creator.id !== userId) {
      throw new UnauthorizedException(`Only creator user can remove the post`);
    }

    await this.postRepo.remove(existingPost);
    return convertToResponseDto(PostResponseDto, {
      ...existingPost,
      creatorId: existingPost.creator.id,
    });
  }
}
