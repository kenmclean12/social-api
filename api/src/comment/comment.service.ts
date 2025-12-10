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
import { CommentCreateDto, CommentResponseDto } from './dto';
import { UserService } from 'src/user/user.service';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/entities/notification.entity';
import { commentMapper } from './utils/comment-mapper';

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

  async findOneInternal(id: number): Promise<Comment> {
    const comment = await this.commentRepo.findOne({
      where: { id },
      relations: this.getRelations(),
    });

    if (!comment) {
      throw new NotFoundException(
        `No comment found with the provided Comment ID: ${id}`,
      );
    }

    return comment;
  }

  async findOne(id: number): Promise<CommentResponseDto> {
    const comment = await this.findOneInternal(id);

    if (!comment) {
      throw new NotFoundException(
        `No comment found with the provided Comment ID: ${id}`,
      );
    }

    return commentMapper(comment);
  }

  async findByPostId(postId: number): Promise<CommentResponseDto[]> {
    await this.postService.findOneInternal(postId);

    const comments = await this.commentRepo.find({
      where: { post: { id: postId } },
      relations: this.getRelations(),
      order: { createdAt: 'DESC' },
    });

    return comments.map((c) => commentMapper(c));
  }

  async create(dto: CommentCreateDto): Promise<CommentResponseDto> {
    const user = await this.userService.findOneInternal(dto.userId);
    const post = await this.postService.findOneInternal(dto.postId);

    const result: Partial<Comment> = { content: dto.content, user, post };

    let parentComment: Comment | undefined = undefined;
    if (dto.parentCommentId) {
      parentComment = await this.findOneInternal(dto.parentCommentId);
      result.parentComment = parentComment;
    }

    const saved = await this.commentRepo.save(result);

    if (post.creator.id !== user.id) {
      await this.notificationService.create({
        recipientId: post.creator.id,
        actorId: dto.userId,
        type: NotificationType.POST_COMMENT,
        postId: post.id,
        commentId: saved.id,
      });
    }

    if (parentComment && parentComment.user.id !== user.id) {
      await this.notificationService.create({
        recipientId: parentComment.user.id,
        actorId: dto.userId,
        type: NotificationType.COMMENT_REPLY,
        postId: post.id,
        commentId: saved.id,
        parentCommentId: parentComment.id,
      });
    }

    return await this.findOne(saved.id);
  }

  async update(
    id: number,
    userId: number,
    content: string,
  ): Promise<CommentResponseDto> {
    const comment = await this.findOneInternal(id);
    const user = await this.userService.findOneInternal(userId);

    if (user.id !== comment.user.id) {
      throw new UnauthorizedException(
        'Only the author of a comment can update it',
      );
    }

    comment.content = content;
    const saved = await this.commentRepo.save(comment);
    return this.findOne(saved.id);
  }

  async remove(id: number, userId: number): Promise<CommentResponseDto> {
    const comment = await this.findOneInternal(id);
    const user = await this.userService.findOneInternal(userId);

    if (user.id !== comment.user.id) {
      throw new UnauthorizedException(
        'Only the author of a comment can remove it',
      );
    }

    await this.commentRepo.remove(comment);
    return commentMapper(comment);
  }

  private getRelations() {
    return [
      'user',
      'post',
      'parentComment',
      'post.creator',
      'replies',
      'replies.user',
      'replies.likes',
      'replies.user',
      'replies.post',
      'likes',
      'likes.message',
      'likes.post',
      'likes.comment',
      'reactions',
      'reactions.user',
      'reactions.message',
      'reactions.post',
      'reactions.comment',
    ];
  }
}
