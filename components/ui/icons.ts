/**
 * Every icon used in the Figma mockups, mapped to its Lucide icon.
 * Screens import from here, never from lucide-react directly, so one change
 * here updates the icon everywhere.
 */
import {
  ArrowRight,
  Calendar,
  CalendarDays,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleHelp,
  CircleX,
  Clock,
  Eye,
  EyeOff,
  FileText,
  HeartHandshake,
  House,
  Info,
  LoaderCircle,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  NotebookPen,
  Phone,
  Sparkles,
  Sun,
  TrendingUp,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

export const icons = {
  // Navigation
  home: House,
  appointments: CalendarDays,
  help: CircleHelp,
  book: CalendarPlus,
  logout: LogOut,
  menu: Menu,
  close: X,
  back: ChevronLeft,
  next: ChevronRight,
  arrowRight: ArrowRight,

  // Appointment details
  date: Calendar,
  time: Clock,
  location: MapPin,
  provider: UserRound,
  phone: Phone,
  today: Sun,
  allKids: Users,

  // Actions
  reportAbsence: MessageCircle,
  showPassword: Eye,
  hidePassword: EyeOff,

  // Badges and status
  careTeam: Users,
  bookedByYou: CircleCheck,
  cancelled: CircleX,
  comingSoon: Sparkles,
  info: Info,
  error: CircleAlert,
  loading: LoaderCircle,

  // "On the way" teaser list
  progress: TrendingUp,
  sessionNote: NotebookPen,
  practice: House,
  paperwork: FileText,
  careCircle: HeartHandshake,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;
