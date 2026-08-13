import {
  AccessScopeType,
  PrismaClient,
} from '../src/generated/prisma/client';

import {
  PermissionCode,
} from '../src/access/constants/permission-code';

import {
  GlobalRoleCode,
} from '../src/access/constants/global-role-code';

import {
  GlobalRoleKey,
} from '../src/access/constants/global-role-key';

const prisma = new PrismaClient();

const permissions = [
  {
    code: PermissionCode.USERS_READ,
    name: 'Read users',
    description:
      'Allows viewing users and user details',
  },
  {
    code: PermissionCode.USERS_BLOCK,
    name: 'Block users',
    description:
      'Allows blocking users',
  },
  {
    code: PermissionCode.USERS_UNBLOCK,
    name: 'Unblock users',
    description:
      'Allows unblocking users',
  },
  {
    code: PermissionCode.USERS_CHANGE_ROLE,
    name: 'Change user roles',
    description:
      'Allows changing global user roles',
  },
  {
    code:
      PermissionCode.USERS_REVOKE_SESSIONS,
    name: 'Revoke user sessions',
    description:
      'Allows revoking active user sessions',
  },
] as const;

const roles = [
  {
    key: GlobalRoleKey.USER,
    code: GlobalRoleCode.USER,
    name: 'User',
    description:
      'Default system user',
  },
  {
    key: GlobalRoleKey.MODERATOR,
    code: GlobalRoleCode.MODERATOR,
    name: 'Moderator',
    description:
      'System moderator',
  },
  {
    key: GlobalRoleKey.ADMIN,
    code: GlobalRoleCode.ADMIN,
    name: 'Administrator',
    description:
      'System administrator',
  },
  {
    key: GlobalRoleKey.OWNER,
    code: GlobalRoleCode.OWNER,
    name: 'Owner',
    description:
      'System owner',
  },
] as const;

const rolePermissions: Record<
  GlobalRoleCode,
  PermissionCode[]
> = {
  [GlobalRoleCode.USER]: [],

  [GlobalRoleCode.MODERATOR]: [],

  [GlobalRoleCode.ADMIN]: [
    PermissionCode.USERS_READ,

    PermissionCode.USERS_BLOCK,
    PermissionCode.USERS_UNBLOCK,

    PermissionCode.USERS_CHANGE_ROLE,

    PermissionCode.USERS_REVOKE_SESSIONS,
  ],

  [GlobalRoleCode.OWNER]: [
    PermissionCode.USERS_READ,

    PermissionCode.USERS_BLOCK,
    PermissionCode.USERS_UNBLOCK,

    PermissionCode.USERS_CHANGE_ROLE,

    PermissionCode.USERS_REVOKE_SESSIONS,
  ],
};

async function main() {
  await prisma.$transaction(
    async (tx) => {
      const permissionIds =
        new Map<
          PermissionCode,
          string
        >();

      for (const permission of permissions) {
        const savedPermission =
          await tx.permission.upsert({
            where: {
              code: permission.code,
            },

            update: {
              name: permission.name,
              description:
                permission.description,
              scopeType:
                AccessScopeType.GLOBAL,
            },

            create: {
              code: permission.code,
              name: permission.name,
              description:
                permission.description,
              scopeType:
                AccessScopeType.GLOBAL,
            },
          });

        permissionIds.set(
          permission.code,
          savedPermission.id,
        );
      }

      const roleIds =
        new Map<
          GlobalRoleCode,
          string
        >();

      for (const role of roles) {
        const savedRole =
          await tx.role.upsert({
            where: {
              key: role.key,
            },

            update: {
              code: role.code,
              name: role.name,
              description:
                role.description,

              scopeType:
                AccessScopeType.GLOBAL,

              ownerScopeId: null,

              isSystem: true,
            },

            create: {
              key: role.key,
              code: role.code,
              name: role.name,
              description:
                role.description,

              scopeType:
                AccessScopeType.GLOBAL,

              ownerScopeId: null,

              isSystem: true,
            },
          });

        roleIds.set(
          role.code,
          savedRole.id,
        );
      }

      for (
        const [roleCode, permissionCodes]
        of Object.entries(
          rolePermissions,
        ) as [
          GlobalRoleCode,
          PermissionCode[],
        ][]
      ) {
        const roleId =
          roleIds.get(roleCode);

        if (!roleId) {
          throw new Error(
            `Role ${roleCode} was not created`,
          );
        }

        const desiredPermissionIds =
          permissionCodes.map(
            (permissionCode) => {
              const permissionId =
                permissionIds.get(
                  permissionCode,
                );

              if (!permissionId) {
                throw new Error(
                  `Permission ${permissionCode} was not created`,
                );
              }

              return permissionId;
            },
          );

        if (
          desiredPermissionIds.length === 0
        ) {
          await tx.rolePermission.deleteMany({
            where: {
              roleId,
            },
          });

          continue;
        }

        await tx.rolePermission.deleteMany({
          where: {
            roleId,

            permissionId: {
              notIn:
                desiredPermissionIds,
            },
          },
        });

        await tx.rolePermission.createMany({
          data:
            desiredPermissionIds.map(
              (permissionId) => ({
                roleId,
                permissionId,
              }),
            ),

          skipDuplicates: true,
        });
      }
    },
  );
}

main()
  .then(() => {
    console.log(
      'Access seed completed successfully',
    );
  })
  .catch((error: unknown) => {
    console.error(
      'Access seed failed',
      error,
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });