import { type Prisma, TeamRole } from '@prisma/client';
import { slugifyWithCounter } from '@sindresorhus/slugify';
import type admin from 'firebase-admin';
import { db } from 'prisma/db.server.ts';
import ProgressBar from 'progress';

import { findUser, mapRole } from './utils.ts';

// Memoize
const memoizedUsers = new Map<string, string>();

const teamsWithoutMembers = [];
const teamsWithouOwner = [];

const slugify = slugifyWithCounter();

/**
 * Migrate Teams and Team members
 */
export async function migrateTeams(firestore: admin.firestore.Firestore) {
  const organizations = (await firestore.collection('organizations').get()).docs;
  const teamProgress = new ProgressBar('  Teams       [:percent] - Elapsed: :elapseds - ETA: :etas (:rate/s) [:bar]', {
    total: organizations.length,
  });

  for (const orgaDoc of organizations) {
    const data = orgaDoc.data();
    teamProgress.tick();

    const members = await mapMembers(data.members, data.owner);

    const team: Prisma.TeamCreateInput = {
      migrationId: orgaDoc.id,
      name: data.name,
      slug: slugify(data.name),
      members: { create: members },
      createdAt: data.createTimestamp?.toDate(),
      updatedAt: data.updateTimestamp?.toDate(),
    };

    if (members.length === 0) {
      teamsWithoutMembers.push(team.migrationId);
      continue;
    } else if (!members.some(({ role }) => role === TeamRole.OWNER)) {
      teamsWithouOwner.push(team.migrationId);
      continue;
    }

    await db.team.create({ data: team });
  }

  console.log(` > Teams without members: ${teamsWithoutMembers.length}`);
  console.log(` > Teams without owner: ${teamsWithouOwner.length}`);
  console.log(` > Teams migrated ${organizations.length - teamsWithoutMembers.length - teamsWithouOwner.length}`);
}

// Map team members to Prisma TeamMemberCreateInput[]
async function mapMembers(map: Record<string, string> = {}, owner?: string) {
  if (!map && !owner) return [];

  if (owner) map[owner] = 'owner'; // Add owner to members list

  const members = [];
  for (const [key, value] of Object.entries(map)) {
    const role = mapRole(value);
    if (!role) continue;
    const memberId = await findUser(key, memoizedUsers);
    if (!memberId) continue;
    members.push({ role, member: { connect: { id: memberId } } });
  }

  return members;
}
