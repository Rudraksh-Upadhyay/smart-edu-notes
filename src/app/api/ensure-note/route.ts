// src/app/api/ensure-note/route.ts
import { createServerClient } from "@supabase/ssr";
import prisma from "@/db/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") ?? "";

    // Create a NextResponse we can set cookies on if supabase needs to set them
    let nodeResponse = NextResponse.next();

    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            // parse cookie header to array as expected by createServerClient
            const cookies: { name: string; value: string }[] = [];
            if (!cookieHeader) return cookies;
            const pairs = cookieHeader.split(";").map((c) => c.trim());
            for (const p of pairs) {
              const eq = p.indexOf("=");
              if (eq > -1) {
                cookies.push({ name: p.slice(0, eq), value: decodeURIComponent(p.slice(eq + 1)) });
              }
            }
            return cookies;
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              nodeResponse.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    // get user via supabase cookies
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "not_authenticated" }), { status: 401 });
    }

    // Try to get newest note for user using prisma
    const newest = await prisma.note.findFirst({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    if (newest?.id) {
      return new Response(JSON.stringify({ noteId: newest.id }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // create a new note if none
    const created = await prisma.note.create({
      data: {
        authorId: user.id,
        text: "",
      },
    });

    return new Response(JSON.stringify({ noteId: created.id }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("ensure-note error:", err?.message ?? err, err?.stack ?? "");
    return new Response(JSON.stringify({ error: "server_error" }), { status: 500 });
  }
}
