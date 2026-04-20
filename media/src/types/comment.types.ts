export interface ICommentUser {
  id: string;
  username: string;
  avatarUrl: string;
}

export interface ICommentReply {
  id: string;
  user: ICommentUser;
  body: string;
  createdAt: string;
}

export interface IComment {
  id: string;
  trackId: string;
  user: ICommentUser;
  body: string;
  createdAt: string;
  replyCount: number;
  replies: ICommentReply[];
  likeCount: number;
}

export interface ICommentService {
  getTrackComments: (trackId: string) => Promise<IComment[]>;
  addComment: (trackId: string, body: string) => Promise<IComment>;
  addReply: (commentId: string, body: string) => Promise<ICommentReply>;
}
