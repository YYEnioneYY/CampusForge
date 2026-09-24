import {
  UserLinkType,
} from '../../generated/prisma/client';

import {
  RpcErrorCode,
} from '../../common/rpc/rpc-error-code';

import {
  throwRpcError,
} from '../../common/rpc/throw-rpc-error';

const PLATFORM_DOMAINS =
  new Map<
    UserLinkType,
    readonly string[]
  >([
    [
      UserLinkType.GITHUB,
      ['github.com'],
    ],

    [
      UserLinkType.TELEGRAM,
      [
        't.me',
        'telegram.me',
      ],
    ],

    [
      UserLinkType.LINKEDIN,
      ['linkedin.com'],
    ],

    [
      UserLinkType.BEHANCE,
      ['behance.net'],
    ],
  ]);

function matchesDomain(
  hostname: string,
  domain: string,
): boolean {
  return (
    hostname === domain ||
    hostname.endsWith(
      `.${domain}`,
    )
  );
}

export function validateUserLinkUrl(
  type: UserLinkType,
  url: string,
): void {
  const hostname =
    new URL(url)
      .hostname
      .toLowerCase();

  const selectedDomains =
    PLATFORM_DOMAINS.get(type);

  if (selectedDomains) {
    const matchesSelectedType =
      selectedDomains.some(
        (domain) =>
          matchesDomain(
            hostname,
            domain,
          ),
      );

    if (!matchesSelectedType) {
      throwRpcError(
        RpcErrorCode
          .USER_LINK_URL_TYPE_MISMATCH,
        'URL does not match selected link type',
      );
    }
  }

  for (
    const [
      detectedType,
      domains,
    ] of PLATFORM_DOMAINS
  ) {
    const matchesDetectedType =
      domains.some(
        (domain) =>
          matchesDomain(
            hostname,
            domain,
          ),
      );

    if (
      matchesDetectedType &&
      detectedType !== type
    ) {
      throwRpcError(
        RpcErrorCode
          .USER_LINK_URL_TYPE_MISMATCH,
        'URL does not match selected link type',
      );
    }
  }
}