import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reaction } from './entities/reaction.entity';
import { UserService } from 'src/user/user.service';
import { MessageService } from 'src/message/message.service';
import { PostService } from 'src/post/post.service';
import { CommentService } from 'src/comment/comment.service';
import { ReactionCreateDto } from './dto';
import { EntityType } from 'src/common/types';

@Injectable()
export class ReactionService {
  constructor(
    @InjectRepository(Reaction)
    private readonly reactionRepo: Repository<Reaction>,
    private readonly userService: UserService,
    private readonly messageService: MessageService,
    private readonly postService: PostService,
    private readonly commentService: CommentService,
  ) {}

  async findReactionsForEntity(
    type: EntityType,
    id: number,
  ): Promise<Reaction[]> {
    const relation = getRelationName(type);
    return await this.reactionRepo.find({
      where: { [relation]: { id } },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async create(dto: ReactionCreateDto): Promise<Reaction> {
    const { userId, messageId, postId, commentId, reaction } = dto;
    const user = await this.userService.findOneInternal(userId);

    let entity: { id: number } | null = null;
    let relationKey: EntityType | null = null;

    switch (true) {
      case !!messageId: {
        entity = await this.messageService.findOne(messageId);
        relationKey = 'message';
        break;
      }
      case !!postId: {
        entity = await this.postService.findOne(postId);
        relationKey = 'post';
        break;
      }
      case !!commentId: {
        entity = await this.commentService.findOne(commentId);
        relationKey = 'comment';
        break;
      }
      default:
        throw new BadRequestException(
          'Must provide one of messageId, postId, commentId',
        );
    }

    const reactionEntity: Partial<Reaction> = {
      user,
      reaction,
      [relationKey]: entity,
    };

    return await this.reactionRepo.save(reactionEntity);
  }

  async remove(id: number): Promise<Reaction> {
    const reaction = await this.reactionRepo.findOne({ where: { id } });
    if (!reaction) {
      throw new BadRequestException(`Reaction with ID ${id} not found`);
    }

    await this.reactionRepo.remove(reaction);
    return reaction;
  }
}

function getRelationName(type: EntityType) {
  const relationMap = {
    message: 'message',
    post: 'post',
    comment: 'comment',
  } as const;

  const relation = relationMap[type];
  if (!relation) throw new BadRequestException('Invalid type');
  return relation;
}
