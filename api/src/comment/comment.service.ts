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
import { convertToResponseDto } from 'src/common/utils';
import { UserResponseDto } from 'src/user/dto';
import { ReactionResponseDto } from 'src/reaction/dto';
import { LikeResponseDto } from 'src/like/dto';

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
      relations: [
        'user',
        'replies',
        'parentComment',
        'replies.user',
        'replies.likes',
        'likes',
        'reactions',
        'reactions.user',
      ],
    });

    if (!comment) {
      throw new NotFoundException(
        `No comment found with the provided Comment ID: ${id}`,
      );
    }

    return comment;
  }

  async findByPostId(postId: number): Promise<CommentResponseDto[]> {
    await this.postService.findOneInternal(postId);

    const comments = await this.commentRepo.find({
      where: { post: { id: postId } },
      relations: [
        'user',
        'replies',
        'parentComment',
        'replies.user',
        'replies.likes',
        'likes',
        'likes.user',
        'reactions',
        'reactions.user',
      ],
      order: { createdAt: 'ASC' },
    });

    return comments.map((c) =>
      convertToResponseDto(CommentResponseDto, {
        ...c,
        user: convertToResponseDto(UserResponseDto, c.user),
        postId,
        parentCommentId: c.parentComment?.id,
        likes: c.likes?.map((l) => {
          return convertToResponseDto(LikeResponseDto, {
            ...l,
            userId: l.user.id,
            commentId: c.id,
          });
        }),
        reactions: c.reactions?.map((r) => {
          return convertToResponseDto(ReactionResponseDto, {
            ...r,
            user: convertToResponseDto(UserResponseDto, r.user),
            commentId: c.id,
          });
        }),
        replies: c.replies?.map((r) =>
          convertToResponseDto(CommentResponseDto, {
            ...r,
            user: convertToResponseDto(UserResponseDto, r.user),
            commentId: c.id,
            parentCommentId: r.parentComment?.id,
            likes: r.likes?.map((l) => {
              return convertToResponseDto(LikeResponseDto, {
                ...l,
                userId: l.user.id,
              });
            }),
            replies: [],
          }),
        ),
      }),
    );
  }

  async create(dto: CommentCreateDto): Promise<CommentResponseDto> {
    const user = await this.userService.findOneInternal(dto.userId);
    const post = await this.postService.findOneInternal(dto.postId);

    const result: Partial<Comment> = { content: dto.content, user, post };

    if (dto.parentCommentId) {
      const parentComment = await this.findOneInternal(dto.parentCommentId);
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

    const fullComment = await this.findOneInternal(saved.id);

    return convertToResponseDto(CommentResponseDto, {
      ...fullComment,
      user: convertToResponseDto(UserResponseDto, fullComment.user),
      postId: post.id,
      parentCommentId: fullComment.parentComment?.id,
      replies: [],
    });
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
    const fullComment = await this.findOneInternal(saved.id);

    return convertToResponseDto(CommentResponseDto, {
      ...fullComment,
      user: convertToResponseDto(UserResponseDto, fullComment.user),
      postId: comment.post.id,
      parentCommentId: comment.parentComment?.id,
    });
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

    return convertToResponseDto(CommentResponseDto, {
      ...comment,
      user: convertToResponseDto(UserResponseDto, comment.user),
      postId: comment.post.id,
      parentCommentId: comment.parentComment?.id,
    });
  }
}
