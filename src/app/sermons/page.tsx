import { Suspense } from "react";
import SermonsClient from "./page-client";
import SermonSkeleton from "@/components/SermonSkeleton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Sermones - Selapp",
  description: "Tus sermones guardados.",
};

export default async function SermonsPage(props: { searchParams: Promise<any> | any }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/"); // Proteger ruta
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    redirect("/");
  }

  // Next.js 15: searchParams es a menudo una Promise asíncrona en el Server
  const resolvedParams = await Promise.resolve(props.searchParams);

  const page = parseInt(resolvedParams?.page || "1", 10);
  const limit = parseInt(resolvedParams?.limit || "12", 10);
  const searchQuery = resolvedParams?.search || "";

  const validPage = page > 0 ? page : 1;
  const validLimit = limit > 0 && limit <= 50 ? limit : 12;
  const skip = (validPage - 1) * validLimit;

  // Realizar misma consulta profunda que la API internamente para SSR veloz
  const whereClause: Prisma.sermonsWhereInput = {
    userId: user.id,
    ...(searchQuery.trim() !== "" ? {
      OR: [
        { title: { contains: searchQuery, mode: "insensitive" } },
        { pastor: { contains: searchQuery, mode: "insensitive" } },
        {
          messages: {
            some: {
              content: { contains: searchQuery, mode: "insensitive" }
            }
          }
        }
      ]
    } : {})
  };

  const [total, sermonsRaw] = await Promise.all([
    prisma.sermons.count({ where: whereClause }),
    prisma.sermons.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
      skip: skip,
      take: validLimit,
      include: {
        _count: {
          select: { messages: true },
        },
      },
    })
  ]);

  // Serializamos las fechas para pasar al Client Component
  const sermonsSSR = sermonsRaw.map(s => ({
    ...s,
    date: s.date.toISOString(),
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));

  const totalPages = Math.ceil(total / validLimit);

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-selapp-beige via-selapp-cream to-white pb-24 p-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (<SermonSkeleton key={i} />))}
        </div>
      </div>
    }>
      <SermonsClient
        initialSermons={sermonsSSR as any}
        initialTotalPages={totalPages}
        initialPage={validPage}
        initialSearch={searchQuery}
      />
    </Suspense>
  );
}
