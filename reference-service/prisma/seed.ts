import 'dotenv/config';

import * as countries from 'i18n-iso-countries';

import {
  PrismaClient,
} from '../src/generated/prisma/client';

import {
  SKILL_SEED_DATA,
} from './data/skills';

import {
  SKILL_ALIAS_SEED_DATA,
} from './data/skill-aliases';

type PreparedSkill = {
  name: string;
  normalizedName: string;
  slug: string;
};

const prisma = new PrismaClient();

function normalizeSkillName(
  value: string,
): string {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function prepareSkillAliases(
  skills: PreparedSkill[],
) {
  const knownSkillSlugs = new Set(
    skills.map((skill) => skill.slug),
  );

  const skillNames = new Set(
    skills.map(
      (skill) => skill.normalizedName,
    ),
  );

  const normalizedAliases = new Set();

  return SKILL_ALIAS_SEED_DATA.flatMap(
    (item) => {
      if (
        !knownSkillSlugs.has(
          item.skillSlug,
        )
      ) {
        throw new Error(
          `Unknown skill slug for aliases: ${item.skillSlug}`,
        );
      }

      return item.aliases.map((value) => {
        const alias = value
          .trim()
          .replace(/\s+/g, ' ');

        const normalizedAlias =
          normalizeSkillName(alias);

        if (!normalizedAlias) {
          throw new Error(
            `Empty alias for skill: ${item.skillSlug}`,
          );
        }

        if (
          skillNames.has(normalizedAlias)
        ) {
          throw new Error(
            `Alias duplicates a skill name: ${alias}`,
          );
        }

        if (
          normalizedAliases.has(
            normalizedAlias,
          )
        ) {
          throw new Error(
            `Duplicate skill alias: ${alias}`,
          );
        }

        normalizedAliases.add(
          normalizedAlias,
        );

        return {
          skillSlug: item.skillSlug,
          alias,
          normalizedAlias,
        };
      });
    },
  );
}

function prepareSkills(): PreparedSkill[] {
  const normalizedNames = new Set();
  const slugs = new Set();

  return SKILL_SEED_DATA.map(
    (skill) => {
      const name = skill.name.trim();

      const normalizedName =
        normalizeSkillName(name);

      const slug = skill.slug
        .trim()
        .toLowerCase();

      if (normalizedNames.has(normalizedName)) {
        throw new Error(
          `Duplicate skill name: ${skill.name}`,
        );
      }

      if (slugs.has(slug)) {
        throw new Error(
          `Duplicate skill slug: ${skill.slug}`,
        );
      }

      if (
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
          slug,
        )
      ) {
        throw new Error(
          `Invalid skill slug: ${slug}`,
        );
      }

      normalizedNames.add(normalizedName);
      slugs.add(slug);

      return {
        name,
        normalizedName,
        slug,
      };
    },
  );
}

async function main(): Promise<void> {
  const alpha2Codes = Object.keys(
    countries.getAlpha2Codes(),
  );

  const skills = prepareSkills();

  const skillAliases = prepareSkillAliases(skills);

  await prisma.$transaction(
    async (tx) => {
      for (const code2 of alpha2Codes) {
        const code3 =
          countries.alpha2ToAlpha3(code2);

        const name =
          countries.getName(
            code2,
            'ru',
            {
              select: 'official',
            },
          );

        if (
          !code3 ||
          typeof name !== 'string'
        ) {
          throw new Error(
            `Country data is incomplete for ${code2}`,
          );
        }

        await tx.country.upsert({
          where: {
            code2,
          },

          create: {
            code2,
            code3,
            name,
            isActive: true,
          },

          update: {},
        });
      }

      for (const skill of skills) {
        await tx.skill.upsert({
          where: {
            slug: skill.slug,
          },

          create: {
            name: skill.name,
            normalizedName:
              skill.normalizedName,
            slug: skill.slug,
            isActive: true,
          },

          update: {
            name: skill.name,
            normalizedName:
              skill.normalizedName,
          },
        });
      }
      for (const skillAlias of skillAliases) {
        await tx.skillAlias.upsert({
          where: {
            normalizedAlias:
              skillAlias.normalizedAlias,
          },
        
          create: {
            alias: skillAlias.alias,
            normalizedAlias:
              skillAlias.normalizedAlias,
          
            skill: {
              connect: {
                slug: skillAlias.skillSlug,
              },
            },
          },
        
          update: {
            alias: skillAlias.alias,
          
            skill: {
              connect: {
                slug: skillAlias.skillSlug,
              },
            },
          },
        });
      }
    },
  );

  console.log(
    `Seed completed: ${skills.length} skills, ${skillAliases.length} aliases`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(
      'Reference data seed failed',
      error,
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });