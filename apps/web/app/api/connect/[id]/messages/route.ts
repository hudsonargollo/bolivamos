import { NextResponse } from "next/server";
import { eq } from "@bolivamos/db";
import { createDb, connectRequests, connectMessages } from "@bolivamos/db";
import { sendConnectMessageRequestSchema, type ConnectMessageDto } from "@bolivamos/api-schema";
import { cf } from "@/lib/cloudflare";
import { requireSession, SessionError } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-errors";
import { isBlockedEitherWay } from "@/lib/connect-guard";

async function loadAuthorizedRequest(db: ReturnType<typeof createDb>, requestId: string, userId: string) {
  const [connectReq] = await db.select().from(connectRequests).where(eq(connectRequests.id, requestId)).limit(1);
  if (!connectReq || (connectReq.fromUserId !== userId && connectReq.toUserId !== userId)) {
    throw new SessionError(404, "Conversation not found");
  }
  if (connectReq.status !== "accepted") {
    throw new SessionError(403, "This request hasn't been accepted yet");
  }
  const otherUserId = connectReq.fromUserId === userId ? connectReq.toUserId : connectReq.fromUserId;
  if (await isBlockedEitherWay(db, userId, otherUserId)) {
    throw new SessionError(403, "This conversation is no longer available");
  }
  return connectReq;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requireSession(request);
    const { env } = cf();
    const db = createDb(env.DB);

    await loadAuthorizedRequest(db, id, session.userId);

    const rows = await db.select().from(connectMessages).where(eq(connectMessages.requestId, id));
    const dto: ConnectMessageDto[] = rows.map((row) => ({
      id: row.id,
      requestId: row.requestId,
      senderId: row.senderId,
      content: row.content,
      createdAt: row.createdAt,
    }));
    return NextResponse.json(dto);
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requireSession(request);
    const body = sendConnectMessageRequestSchema.parse(await request.json());
    const { env } = cf();
    const db = createDb(env.DB);

    await loadAuthorizedRequest(db, id, session.userId);

    const messageId = crypto.randomUUID();
    await db.insert(connectMessages).values({
      id: messageId,
      requestId: id,
      senderId: session.userId,
      content: body.content,
    });

    const [created] = await db.select().from(connectMessages).where(eq(connectMessages.id, messageId)).limit(1);
    if (!created) throw new Error("Failed to load created message");

    const dto: ConnectMessageDto = {
      id: created.id,
      requestId: created.requestId,
      senderId: created.senderId,
      content: created.content,
      createdAt: created.createdAt,
    };
    return NextResponse.json(dto, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
