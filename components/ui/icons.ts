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
  Hand,
  HeartHandshake,
  House,
  Info,
  LoaderCircle,
  LogOut,
  MapPin,
  MessagesSquare,
  Menu,
  MessageCircle,
  NotebookPen,
  Phone,
  Search,
  Sparkles,
  Sun,
  Trash2,
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
  delete: Trash2,
  showPassword: Eye,
  hidePassword: EyeOff,

  // Badges and status
  careTeam: Users,
  bookedByYou: UserRound,
  success: CircleCheck,
  cancelled: CircleX,
  comingSoon: Sparkles,
  info: Info,
  error: CircleAlert,
  loading: LoaderCircle,

  // Care plan rows, by discipline
  aba: Users,
  speech: MessagesSquare,
  ot: Hand,

  // Not found
  search: Search,

  // "On the way" teaser list
  progress: TrendingUp,
  sessionNote: NotebookPen,
  practice: House,
  paperwork: FileText,
  careCircle: HeartHandshake,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;
