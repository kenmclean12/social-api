import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { PostService } from 'src/post/post.service';
import { CommentCreateDto } from './dto';
import { UserService } from 'src/user/user.service';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/entities/notification.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    private readonly postService: PostService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) {}

  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentRepo.findOne({
      where: { id },
      relations: [
        'user',
        'post',
        'parentComment',
        'replies',
        'replies.user',
        'replies.likes',
        'likes',
        'reactions',
      ],
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
      relations: [
        'user',
        'replies',
        'parentComment',
        'replies.user',
        'replies.likes',
        'likes',
        'reactions',
      ],
      order: { createdAt: 'ASC' },
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

    const saved = await this.commentRepo.save(result);

    if (post.creator.id !== user.id) {
      await this.notificationService.create({
        recipientId: post.creator.id,
        actorId: dto.userId,
        type: NotificationType.POST_COMMENT,
        postId: post.id,
      });
    }

    return saved;
  }

  async update(id: number, userId: number, content: string): Promise<Comment> {
    const comment = await this.findOne(id);
    const user = await this.userService.findOneInternal(userId);

    if (user.id !== comment.user.id) {
      throw new UnauthorizedException(
        'Only the author of a comment can update it',
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
        `Only the author of a comment can remove it`,
      );
    }

    await this.commentRepo.remove(comment);
    return comment;
  }
}
