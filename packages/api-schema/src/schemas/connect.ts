import { z } from "zod";

export const connectRequestStatusSchema = z.enum(["pending", "accepted", "declined"]);
export type ConnectRequestStatus = z.infer<typeof connectRequestStatusSchema>;

export const attendeeSchema = z.object({
  userId: z.string(),
  fullName: z.string().nullable(),
});
export type AttendeeDto = z.infer<typeof attendeeSchema>;

export const setAttendanceRequestSchema = z.object({
  visible: z.boolean(),
});
export type SetAttendanceRequest = z.infer<typeof setAttendanceRequestSchema>;

export const connectRequestSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  fromUserId: z.string(),
  toUserId: z.string(),
  status: connectRequestStatusSchema.nullable(),
  createdAt: z.string().nullable(),
});
export type ConnectRequestDto = z.infer<typeof connectRequestSchema>;

export const createConnectRequestSchema = z.object({
  eventId: z.string(),
  toUserId: z.string(),
});
export type CreateConnectRequest = z.infer<typeof createConnectRequestSchema>;

export const respondConnectRequestSchema = z.object({
  accept: z.boolean(),
});
export type RespondConnectRequest = z.infer<typeof respondConnectRequestSchema>;

export const connectMessageSchema = z.object({
  id: z.string(),
  requestId: z.string(),
  senderId: z.string(),
  content: z.string(),
  createdAt: z.string().nullable(),
});
export type ConnectMessageDto = z.infer<typeof connectMessageSchema>;

export const sendConnectMessageRequestSchema = z.object({
  content: z.string().min(1).max(2000),
});
export type SendConnectMessageRequest = z.infer<typeof sendConnectMessageRequestSchema>;

export const reportUserRequestSchema = z.object({
  reportedId: z.string(),
  reason: z.string().min(1).max(500),
  context: z.string().max(2000).optional(),
});
export type ReportUserRequest = z.infer<typeof reportUserRequestSchema>;

export const userReportSchema = z.object({
  id: z.string(),
  reporterId: z.string(),
  reportedId: z.string(),
  reason: z.string(),
  context: z.string().nullable(),
  status: z.enum(["open", "reviewed", "dismissed"]).nullable(),
  createdAt: z.string().nullable(),
});
export type UserReportDto = z.infer<typeof userReportSchema>;
