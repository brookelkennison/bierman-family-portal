import Image from "next/image";

/**
 * Illustrated avatars for the seeded demo kids (Figma). Any other child gets
 * initials on a tint. Never photos of real children.
 */
const illustrated: Record<string, { src: string; tint: string }> = {
  maya: { src: "/avatars/maya.jpg", tint: "bg-pink-tint" },
  leo: { src: "/avatars/leo.jpg", tint: "bg-green-tint" },
};

const sizes = {
  28: "size-7 text-tiny",
  40: "size-10 text-small",
  68: "size-17 text-h2",
} as const;

type KidAvatarProps = {
  firstName: string;
  size?: keyof typeof sizes;
  /**
   * Leave out when the child's name is already shown next to the avatar
   * (the image is then decorative). Set it when the avatar stands alone.
   */
  alt?: string;
};

export function KidAvatar({ firstName, size = 40, alt = "" }: KidAvatarProps) {
  const art = illustrated[firstName.toLowerCase()];
  if (art) {
    return (
      <Image
        src={art.src}
        alt={alt}
        width={size}
        height={size}
        className={`shrink-0 rounded-full object-cover ${art.tint} ${sizes[size]}`}
      />
    );
  }
  return (
    <span
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      className={`flex shrink-0 items-center justify-center rounded-full bg-aqua-tint font-semibold text-navy ${sizes[size]}`}
    >
      {firstName.charAt(0).toUpperCase()}
    </span>
  );
}

/** Background tint behind a kid's bubble, matching their avatar. */
export function kidTint(firstName: string) {
  return illustrated[firstName.toLowerCase()]?.tint ?? "bg-aqua-tint";
}
