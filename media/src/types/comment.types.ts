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
  comments: ICommentReply[]; // For backward compatibility with older API responses that use "comments" instead of "replies"
}

export interface ICommentService {
  getTrackComments: (trackId: string) => Promise<IComment[]>;
  addComment: (trackId: string, body: string) => Promise<IComment>;
  addReply: (commentId: string, body: string) => Promise<ICommentReply>;
}