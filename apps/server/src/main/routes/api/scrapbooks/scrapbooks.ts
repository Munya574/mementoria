import type { FastifyInstance, FastifyRequest } from "fastify";

import { auth } from "../../../lib/auth.js";
import { prisma } from "../../../lib/prisma.js";

interface PageItemBody {
  id: string;
  type: string;
  content: string;
  x: number;
  y: number;
}

interface PageBody {
  id: string;
  title: string;
  items: PageItemBody[];
}

interface ScrapbookBody {
  id: string;
  title: string;
  pages: PageBody[];
}

async function getSession(request: FastifyRequest) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(request.headers)) {
    if (value) {
      headers.append(key, Array.isArray(value) ? value.join(", ") : value);
    }
  }
  return auth.api.getSession({ headers });
}

export default async function (fastify: FastifyInstance) {
  // GET /api/scrapbooks — list all scrapbooks for the authenticated user
  fastify.get("/", async (request, reply) => {
    try {
      const session = await getSession(request);
      if (!session) return reply.status(401).send({ error: "Unauthorized" });

      const scrapbooks = await prisma.scrapbook.findMany({
        where: { userId: session.user.id },
        include: {
          pages: {
            orderBy: { order: "asc" },
            include: { items: true },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      return reply.send(scrapbooks);
    } catch (error) {
      fastify.log.error("GET /api/scrapbooks error:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  // POST /api/scrapbooks — create a new scrapbook
  fastify.post("/", async (request, reply) => {
    try {
      const session = await getSession(request);
      if (!session) return reply.status(401).send({ error: "Unauthorized" });

      const body = request.body as ScrapbookBody;

      if (!body.id || !body.title) {
        return reply.status(400).send({ error: "id and title are required" });
      }

      const scrapbook = await prisma.scrapbook.create({
        data: {
          id: body.id,
          title: body.title,
          userId: session.user.id,
          pages: {
            create: body.pages.map((page, index) => ({
              id: page.id,
              title: page.title,
              order: index,
              items: {
                create: page.items.map((item) => ({
                  id: item.id,
                  type: item.type,
                  content: item.content,
                  x: item.x,
                  y: item.y,
                })),
              },
            })),
          },
        },
        include: {
          pages: {
            orderBy: { order: "asc" },
            include: { items: true },
          },
        },
      });

      return reply.status(201).send(scrapbook);
    } catch (error) {
      fastify.log.error("POST /api/scrapbooks error:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  // PUT /api/scrapbooks/:id — replace the full scrapbook content
  fastify.put("/:id", async (request, reply) => {
    try {
      const session = await getSession(request);
      if (!session) return reply.status(401).send({ error: "Unauthorized" });

      const { id } = request.params as { id: string };
      const body = request.body as ScrapbookBody;

      const existing = await prisma.scrapbook.findUnique({ where: { id } });
      if (!existing) return reply.status(404).send({ error: "Not found" });
      if (existing.userId !== session.user.id) {
        return reply.status(403).send({ error: "Forbidden" });
      }

      const scrapbook = await prisma.$transaction(async (tx) => {
        // Delete all existing pages (items cascade via onDelete: Cascade)
        await tx.page.deleteMany({ where: { scrapbookId: id } });

        return tx.scrapbook.update({
          where: { id },
          data: {
            title: body.title,
            pages: {
              create: body.pages.map((page, index) => ({
                id: page.id,
                title: page.title,
                order: index,
                items: {
                  create: page.items.map((item) => ({
                    id: item.id,
                    type: item.type,
                    content: item.content,
                    x: item.x,
                    y: item.y,
                  })),
                },
              })),
            },
          },
          include: {
            pages: {
              orderBy: { order: "asc" },
              include: { items: true },
            },
          },
        });
      });

      return reply.send(scrapbook);
    } catch (error) {
      fastify.log.error("PUT /api/scrapbooks/:id error:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  // DELETE /api/scrapbooks/:id
  fastify.delete("/:id", async (request, reply) => {
    try {
      const session = await getSession(request);
      if (!session) return reply.status(401).send({ error: "Unauthorized" });

      const { id } = request.params as { id: string };

      const existing = await prisma.scrapbook.findUnique({ where: { id } });
      if (!existing) return reply.status(404).send({ error: "Not found" });
      if (existing.userId !== session.user.id) {
        return reply.status(403).send({ error: "Forbidden" });
      }

      await prisma.scrapbook.delete({ where: { id } });

      return reply.status(204).send();
    } catch (error) {
      fastify.log.error("DELETE /api/scrapbooks/:id error:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });
}
