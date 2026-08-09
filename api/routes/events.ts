import { Router, type IRouter } from "../http";
import { eq, desc } from "@workspace/db";
import { db, eventsTable } from "@workspace/db";
import {
  ListEventsQueryParams,
  ListEventsResponse,
  GetEventParams,
  GetEventResponse,
} from "../lib/api-zod";

const router: IRouter = Router();

router.get("/events", async (req, res): Promise<void> => {
  const query = ListEventsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const rows = await db.select().from(eventsTable).orderBy(desc(eventsTable.createdAt));

  const filtered =
    query.data.upcoming !== undefined
      ? rows.filter((r) => (r.isUpcoming === "true") === query.data.upcoming)
      : rows;

  const limited = filtered.slice(0, query.data.limit ?? 10);

  res.json(
    ListEventsResponse.parse(
      limited.map((r) => ({
        ...r,
        isUpcoming: r.isUpcoming === "true",
        attendeesCount: r.attendeesCount ?? null,
      }))
    )
  );
});

router.get("/events/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetEventParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [event] = await db
    .select()
    .from(eventsTable)
    .where(eq(eventsTable.id, params.data.id));

  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  res.json(
    GetEventResponse.parse({
      ...event,
      isUpcoming: event.isUpcoming === "true",
      attendeesCount: event.attendeesCount ?? null,
    })
  );
});

export default router;
