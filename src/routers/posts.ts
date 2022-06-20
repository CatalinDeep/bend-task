import { Router, RequestHandler } from 'express';
import { Op } from 'sequelize';

import type { SequelizeClient } from '../sequelize';
import type { Post } from '../repositories/types';

import { BadRequestError, ForbiddenError, UnauthorizedError } from '../errors';
import { hashPassword, generateToken, extraDataFromToken } from '../security';
import {
  initTokenValidationRequestHandler,
  initAdminValidationRequestHandler,
  RequestAuth,
} from '../middleware/security';
import { UserType } from '../constants';

export function initPostsRouter(sequelizeClient: SequelizeClient): Router {
  const router = Router({ mergeParams: true });

  const tokenValidation = initTokenValidationRequestHandler(sequelizeClient);
  const adminValidation = initAdminValidationRequestHandler();

  router
    .route('/list')
    .get(tokenValidation, initListPostsRequestHandler(sequelizeClient));
  router
    .route('/add')
    .post(
      tokenValidation,
      initValidationAddPostRequestHandler(),
      initAddPostRequestHandler(sequelizeClient)
    );
  router
    .route('/delete')
    .post(tokenValidation, initDeletePostRequestHandler(sequelizeClient));
  return router;
}

function initListPostsRequestHandler(
  sequelizeClient: SequelizeClient
): RequestHandler {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  return async function listPostsRequestHandler(req, res, next): Promise<void> {
    const { models } = sequelizeClient;
    try {
      const authorizationHeaderValue = req.header('authorization') || '';
      const posts: Post[] = await models.posts.findAll({
        attributes: ['id', 'title', 'content', 'isHidden', 'authorId'],
        raw: true,
      });
      const [type, token] = authorizationHeaderValue.split(' ');
      const userId = extraDataFromToken(token).id;
      const {
        auth: {
          user: { type: userType },
        },
      } = req as unknown as { auth: RequestAuth };
      if (userType === UserType.ADMIN) {
        res.send(posts);
        res.end();
      } else {
        const filtredPosts: Post[] = [];
        posts.forEach((post: Post) => {
          post.authorId === userId
            ? filtredPosts.push(post)
            : post.isHidden === false
            ? filtredPosts.push(post)
            : null;
        });
        res.send(filtredPosts);
        res.end();
      }
    } catch (err) {
      console.log(err);
      next(err);
    }
  };
}

function initAddPostRequestHandler(
  sequelizeClient: SequelizeClient
): RequestHandler {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  return async function addPostRequestHandler(req, res, next): Promise<void> {
    try {
      const { content, isHidden, title } = req.body as AddPostData;
      const authorizationHeaderValue = req.header('authorization') || '';
      const [type, token] = authorizationHeaderValue.split(' ');
      const authorId = extraDataFromToken(token).id;
      await AddPost(
        {
          content,
          isHidden,
          title,
        },
        authorId,
        sequelizeClient
      );

      res.status(204).end();
    } catch (err) {
      console.log(err);
      next(err);
    }
  };
}
function initDeletePostRequestHandler(
  sequelizeClient: SequelizeClient
): RequestHandler {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  return async function deletePostRequestHandler(
    req,
    res,
    next
  ): Promise<void> {
    try {
      const body = req.body as DeletePostData;
      const authorizationHeaderValue = req.header('authorization') || '';
      const [type, token] = authorizationHeaderValue.split(' ');
      const userId = extraDataFromToken(token).id;
      const {
        auth: {
          user: { type: userType },
        },
      } = req as unknown as { auth: RequestAuth };
      const { models } = sequelizeClient;
      const targetPost = await models.posts.findByPk(body.id);

      if (userType === UserType.ADMIN || userId === targetPost?.authorId) {
        await models.posts.destroy({
          where: { id: body.id },
        });
        res.status(204);
        res.end();
      } else {
        throw new ForbiddenError('FORBIDDEN');
      }
    } catch (err) {
      console.log(err);
      next(err);
    }
  };
}
function initValidationAddPostRequestHandler(): RequestHandler {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  return function validationAddPostRequestHandler(req, res, next): void {
    try {
      const { content, title } = req.body as AddPostData;
      const titleRegex = /[^A-Za-z0-9]+/;
      if (!title) {
        throw new BadRequestError('Missing title');
      }
      if (!content) {
        throw new BadRequestError('Missing content');
      }
      if (titleRegex.test(title) || title.length > 20) {
        throw new BadRequestError(
          'The post title must contain only letters and numbers with a maximum length of 20'
        );
      }
      if (content.length > 100) {
        throw new BadRequestError(
          'The post content must contain maximum length of 100'
        );
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
}
async function AddPost(
  data: AddPostData,
  authorId: number,
  sequelizeClient: SequelizeClient
): Promise<void> {
  const { content, isHidden, title } = data;
  const { models } = sequelizeClient;

  await models.posts.create({
    authorId,
    content,
    isHidden,
    title,
  });
}

type AddPostData = Pick<Post, 'title' | 'content' | 'isHidden'>;
type DeletePostData = Pick<Post, 'id'>;
