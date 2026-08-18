import 'dotenv/config';

import * as countries from 'i18n-iso-countries';

import {
  PrismaClient,
} from '../src/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  const alpha2Codes = Object.keys(
    countries.getAlpha2Codes(),
  );

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
    },
  );
}

main()
  .then(() => {
    console.log(
      'Countries seed completed successfully',
    );
  })
  .catch((error: unknown) => {
    console.error(
      'Countries seed failed',
      error,
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });