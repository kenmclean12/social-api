import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { PostService } from 'src/post/post.service';
import { CommentCreateDto, CommentUpdateDto } from './dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    private readonly postService: PostService,
    private readonly userService: UserService,
  ) {}

  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentRepo.findOne({
      where: { id },
      relations: ['user', 'post', 'parentComment', 'replies'],
    });

    if (!comment) {
      throw new NotFoundException(
        `No comment found with the provided Comment ID: ${id}`,
      );
    }

    return comment;
  }

  async findByPostId(postId: number): Promise<Comment[]> {
    await this.postService.findOne(postId);
    return await this.commentRepo.find({
      where: { post: { id: postId } },
      relations: ['user', 'parentComment', 'replies'],
    });
  }

  async create(dto: CommentCreateDto): Promise<Comment> {
    const user = await this.userService.findOneInternal(dto.userId);
    const post = await this.postService.findOne(dto.postId);

    const result: Partial<Comment> = { content: dto.content, user, post };
    if (dto.parentCommentId) {
      const parentComment = await this.findOne(dto.parentCommentId);
      result.parentComment = parentComment;
    }

    return await this.commentRepo.save(result);
  }

  async update(
    id: number,
    { userId, content }: CommentUpdateDto,
  ): Promise<Comment> {
    const comment = await this.findOne(id);
    const user = await this.userService.findOneInternal(userId);

    if (user.id !== comment.user.id) {
      throw new UnauthorizedException(
        `Only the author of a comment can update the record from the database`,
      );
    }

    comment.content = content;
    return await this.commentRepo.save(comment);
  }

  async remove(id: number, userId: number): Promise<Comment> {
    const comment = await this.findOne(id);
    const user = await this.userService.findOneInternal(userId);

    if (user.id !== comment.user.id) {
      throw new UnauthorizedException(
        `Only the author of a comment can remove the record from the database`,
      );
    }

    await this.commentRepo.remove(comment);
    return comment;
  }
}
