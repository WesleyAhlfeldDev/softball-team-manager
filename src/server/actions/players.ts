"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { FieldingPosition } from "@prisma/client";

const VALID_GENDERS = ["MALE", "FEMALE", "NON_BINARY", "PREFER_NOT_TO_SAY"] as const;

const playerSchema = z.object({
  firstName:       z.string().min(1, "First name is required").max(50),
  lastName:        z.string().min(1, "Last name is required").max(50),
  jerseyNumber:    z.string().max(4).optional(),
  gender:          z.enum(VALID_GENDERS).optional(),
  primaryPosition: z.nativeEnum(FieldingPosition),
  positions:       z.array(z.nativeEnum(FieldingPosition)).default([]),
  notes:           z.string().max(500).optional(),
});

async function getTeamId() {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const team = await prisma.team.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!team) throw new Error("No team found");
  return team.id;
}

function parseFormData(formData: FormData) {
  const gender = formData.get("gender") as string;
  return {
    firstName:       formData.get("firstName") as string,
    lastName:        formData.get("lastName") as string,
    jerseyNumber:    (formData.get("jerseyNumber") as string) || undefined,
    gender:          (VALID_GENDERS as readonly string[]).includes(gender)
                       ? (gender as typeof VALID_GENDERS[number])
                       : undefined,
    primaryPosition: formData.get("primaryPosition") as FieldingPosition,
    positions:       formData.getAll("positions") as FieldingPosition[],
    notes:           (formData.get("notes") as string) || undefined,
  };
}

export async function addPlayer(formData: FormData) {
  const teamId = await getTeamId();
  const parsed = playerSchema.safeParse(parseFormData(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid data" };

  if (parsed.data.jerseyNumber) {
    const existing = await prisma.player.findFirst({
      where: { teamId, jerseyNumber: parsed.data.jerseyNumber, isActive: true },
    });
    if (existing) return { error: `Jersey #${parsed.data.jerseyNumber} is already taken` };
  }

  const { jerseyNumber, gender, notes, ...required } = parsed.data;
  await prisma.player.create({
    data: {
      teamId, ...required,
      jerseyNumber: jerseyNumber ?? null,
      gender: gender ?? null,
      notes: notes ?? null,
    },
  });

  revalidatePath("/roster");
  return { success: true };
}

export async function updatePlayer(playerId: string, formData: FormData) {
  const teamId = await getTeamId();
  const parsed = playerSchema.safeParse(parseFormData(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid data" };

  if (parsed.data.jerseyNumber) {
    const existing = await prisma.player.findFirst({
      where: { teamId, jerseyNumber: parsed.data.jerseyNumber, isActive: true, NOT: { id: playerId } },
    });
    if (existing) return { error: `Jersey #${parsed.data.jerseyNumber} is already taken` };
  }

  const { jerseyNumber: jn, gender: g, notes: n, ...requiredFields } = parsed.data;
  await prisma.player.update({
    where: { id: playerId, teamId },
    data: { ...requiredFields, jerseyNumber: jn ?? null, gender: g ?? null, notes: n ?? null },
  });

  revalidatePath("/roster");
  return { success: true };
}

export async function togglePlayerActive(playerId: string, isActive: boolean) {
  const teamId = await getTeamId();
  await prisma.player.update({ where: { id: playerId, teamId }, data: { isActive } });
  revalidatePath("/roster");
  return { success: true };
}

export async function deletePlayer(playerId: string) {
  const teamId = await getTeamId();
  await prisma.player.delete({ where: { id: playerId, teamId } });
  revalidatePath("/roster");
  return { success: true };
}
