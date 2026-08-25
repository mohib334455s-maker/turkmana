/** Client IP, CIDR checks, and mobile user-agent detection. */

export const DEFAULT_COMPANY_CIDRS = [
  '10.0.0.0/8',
  '172.16.0.0/12',
  '192.168.0.0/16',
];

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || '127.0.0.1';
  const real = request.headers.get('x-real-ip');
  if (real) return real.trim();
  return '127.0.0.1';
}

export function isMobileUserAgent(userAgent: string): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
    userAgent
  );
}

function ipToInt(ip: string): number | null {
  const parts = ip.split('.').map((p) => Number(p));
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) {
    return null;
  }
  return (
    ((parts[0] << 24) >>> 0) +
    ((parts[1] << 16) >>> 0) +
    ((parts[2] << 8) >>> 0) +
    (parts[3] >>> 0)
  );
}

export function ipInCidr(ip: string, cidr: string): boolean {
  const [range, bitsStr] = cidr.split('/');
  const bits = Number(bitsStr);
  const ipInt = ipToInt(ip);
  const rangeInt = ipToInt(range);
  if (ipInt == null || rangeInt == null || Number.isNaN(bits) || bits < 0 || bits > 32) {
    return false;
  }
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return (ipInt & mask) === (rangeInt & mask);
}

export function ipAllowed(ip: string, cidrs: string[]): boolean {
  if (!cidrs.length) return true;
  if (ip === '127.0.0.1' || ip === '::1') return true;
  return cidrs.some((cidr) => ipInCidr(ip, cidr));
}

export type RoleNetworkPolicy = {
  companyNetworkOnly?: boolean;
  blockMobile?: boolean;
  allowedCidrs?: string[];
};

export function checkNetworkAccess(opts: {
  ip: string;
  userAgent: string;
  policy?: RoleNetworkPolicy | null;
}): { ok: true } | { ok: false; reason: 'mobile' | 'network' } {
  const policy = opts.policy;
  if (!policy) return { ok: true };

  if (policy.blockMobile && isMobileUserAgent(opts.userAgent)) {
    return { ok: false, reason: 'mobile' };
  }

  if (policy.companyNetworkOnly) {
    const cidrs = policy.allowedCidrs?.length ? policy.allowedCidrs : DEFAULT_COMPANY_CIDRS;
    if (!ipAllowed(opts.ip, cidrs)) {
      return { ok: false, reason: 'network' };
    }
  }

  return { ok: true };
}
