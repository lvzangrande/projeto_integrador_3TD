/* Ícones SVG inline (sem dependências), no mesmo estilo dos ícones da tabela. */

function Icon({ children, size = 22, ...props }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
      >
        {children}
      </svg>
    );
  }
  
  export const IconUserPlus = (p) => (
    <Icon {...p}>
      <circle cx="10" cy="8" r="4" />
      <path d="M2.5 21c.8-4 3.7-6 7.5-6 1.2 0 2.3.2 3.2.6" />
      <path d="M19 14v6M16 17h6" />
    </Icon>
  );
  
  export const IconUser = (p) => (
    <Icon {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1-4 4-6 8-6s7 2 8 6" />
    </Icon>
  );
  
  export const IconIdCard = (p) => (
    <Icon {...p}>
      <rect x="2.5" y="5" width="19" height="14" rx="3" />
      <circle cx="8.5" cy="11" r="1.8" />
      <path d="M5.5 16c.5-1.5 1.7-2.2 3-2.2s2.5.7 3 2.2" />
      <path d="M14.5 10.5h4M14.5 14h4" />
    </Icon>
  );
  
  export const IconMail = (p) => (
    <Icon {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3.5 7.5l8.5 6 8.5-6" />
    </Icon>
  );
  
  export const IconPhone = (p) => (
    <Icon {...p}>
      <path d="M5 4h3.5l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5L16 14l4 1.5V19a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </Icon>
  );
  
  export const IconLock = (p) => (
    <Icon {...p}>
      <rect x="5" y="11" width="14" height="10" rx="2.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      <path d="M12 15.5v2" />
    </Icon>
  );
  
  export const IconEye = (p) => (
    <Icon {...p}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  );
  
  export const IconEyeOff = (p) => (
    <Icon {...p}>
      <path d="M10.6 6.2A9.7 9.7 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.2 3.9" />
      <path d="M6.6 7.6C3.9 9.4 2 12 2 12s3.5 6 10 6c1.5 0 2.9-.3 4.1-.9" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <path d="M3 3l18 18" />
    </Icon>
  );
  
  export const IconX = (p) => (
    <Icon {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  );