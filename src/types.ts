
export interface ApplicationUser {
  id: string;
  userName?: string;
  email?: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string;
  description: string;
  followersCount: number;
  followingCount: number;
  isProfilePublic: boolean;
  createdAt: Date;
  

  posts?: Post[];
  likeCount?: number;
  comments?: Comment[];
  matchAssignments?: MatchAssignment[];
  chatUsers?: ChatUser[];
  messages?: Message[];
  following?: Follow[];
  followers?: Follow[];
  followingRequest?: FollowRequest[];
  followerRequest?: FollowRequest[];
}

export interface Championship {
  championshipId: string;
  name: string;
  location: string;
  startDate: Date;
  endDate: Date;
  matches?: Match[];
}

export interface Match {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: Date;
  location: string;
  championshipId: string;
  championship?: Championship;
  matchAssignments?: MatchAssignment[];
  groupChat?: Chat;
}

export interface MatchAssignment {
  matchAssignmentId: string;
  matchId: string;
  userId: string;
  role: string;
  assignedAt: Date;
  match?: Match;
  user?: ApplicationUser;
}

export interface Chat {
  chatId: string;
  matchId?: string;
  createdAt: Date;
  match?: Match;
  chatUsers?: ChatUser[];
  messages?: Message[];
}

export interface ChatUser {
  chatId: string;
  userId: string;
  joinedAt: Date;
  chat?: Chat;
  user?: ApplicationUser;
}

export interface Message {
  messageId: string;
  chatId: string;
  userId: string;
  content: string;
  sentAt: Date;
  chat?: Chat;
  user?: ApplicationUser;
}

export interface Post {
  postId: string;
  likeCount: number;
  userId: string;
  mediaType: string;
  mediaUrl: string;
  description: string;
  createdAt: Date;
  user?: ApplicationUser;
  comments?: Comment[];
  likes?: Like[];
}

export interface Comment {
  commentId: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: Date;
  parentCommentId?: string;
  post?: Post;
  user?: ApplicationUser;
  parentComment?: Comment;
  replies?: Comment[];
}

export interface Follow {
  followerId: string;
  followingId: string;
  followedAt: Date;
  follower?: ApplicationUser;
  following?: ApplicationUser;
}

export interface FollowRequest {
  followerId: string;
  followingId: string;
  requestedAt: Date;
  followerRequest?: ApplicationUser;
  followingRequest?: ApplicationUser;
}

export interface Like {
  userId: string;
  postId: string;
  likedAt: Date;
  user?: ApplicationUser;
  post?: Post;
}

export interface LikeDto{
  userId: string;
  postId: string;
  likedAt: Date;

}


// dtos.ts

// Championship DTOs
export interface ChampionshipDto {
  championshipId: string;
  name: string;
  location: string;
  startDate: Date;
  endDate: Date;
}

export interface CreateChampionshipDto {
  name: string;
  location: string;
  startDate: Date;
  endDate: Date;
}

export interface UpdateChampionshipDto {
  name: string;
  location: string;
  startDate: Date;
  endDate: Date;
}

// Comment DTOs
export interface CommentDto {
  commentId: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: Date;
  parentCommentId?: string;
}

export interface CreateCommentDto {
  postId: string;
  content: string;
  userId: string;
  parentCommentId?: string;
}

export interface UpdateCommentDto {
  content: string;
}

// Match DTOs
export interface MatchDto {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: Date;
  location: string;
  championshipId: string;
}

export interface CreateMatchDto {
  homeTeam: string;
  awayTeam: string;
  matchDate: Date;
  location: string;
  championshipId: string;
}

export interface UpdateMatchDto {
  homeTeam: string;
  awayTeam: string;
  matchDate: Date;
  location: string;
  championshipId: string;
}

// Match Assignment DTOs
export interface MatchAssignmentDto {
  matchAssignmentId: string;
  matchId: string;
  userId: string;
  role: string;
  assignedAt: Date;
}

export interface CreateMatchAssignmentDto {
  matchId: string;
  userId: string;
  role: string;
}

export interface UpdateMatchAssignmentDto {
  role: string;
}

// Post DTOs
export interface PostDto {
  postId: string;
  likeCount: number;
  userId: string;
  mediaType: string;
  mediaUrl: string;
  description: string;
  createdAt: Date;
  comments?: CommentDto[];
}

export interface CreatePostDto {
  mediaType: string;
  mediaUrl: string;
  description: string;
  userId: string;

}

export interface UpdatePostDto {
  description: string;
  mediaUrl: string;
  mediaType: string;
}

// User DTOs
export interface UserDto {
  id: string;
  userName?: string;
  email?: string;
  firstName: string;
  lastName: string;
  description: string;
  profileImageUrl: string;
  isProfilePublic: boolean;
  createdAt: Date;
  followersCount: number;
  followingCount: number;
}

export interface CreateUserDto {
  userName: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  description?: string;
  profileImageUrl?: string;
}

export interface UpdateUserDto {
  userName: string;
  firstName: string;
  lastName: string;
  description: string;
  profileImageUrl: string;
  isProfilePublic: boolean;
}

export interface ProfileDto {
  userName?: string;
  fullName: string;
  description: string;
  followersCount: number;
  followingCount: number;
  profileImageUrl: string;
  isProfilePublic: boolean;
}

export interface ProfileExtendedDto extends ProfileDto {

  Posts?: PostDto[];


}


export interface LoginDto {
  userName: string;
  password: string;
}

// Chat DTOs
export interface ChatDto {
  chatId: string;
  matchId?: string;
  createdAt: Date;
  members?: ChatUserDto[];
}

export interface ChatUserDto {
  chatId: string;
  userId: string;
  joinedAt: Date;
}

export interface MessageDto {
  messageId: string;
  chatId: string;
  senderId: string;
  senderName: string;
  content: string;
  mediaUrl?: string;
  createdAt: Date;
  edited: boolean;
}

export interface CreateMessageDto {
  content: string;
  mediaUrl?: string;
}


export interface PagedResult<T> {
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
}