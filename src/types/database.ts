/**
 * Типы схемы БД (этап 2).
 * После `supabase gen types` можно заменить на сгенерированные.
 */

export type UserRole = "admin" | "editor";
export type ContentStatus = "draft" | "published" | "archived";
export type EnrollmentStatus = "open" | "closed" | "waitlist" | "full";
export type RegistrationStatus = "open" | "closed" | "waitlist" | "cancelled";
export type AudienceType = "children" | "parents" | "family" | "mixed";
export type EventFormat =
  | "workshop"
  | "quiz"
  | "game"
  | "meeting"
  | "other";
export type ApplicationType = "program" | "event" | "membership" | "general";
export type ApplicationStatus =
  | "new"
  | "contacted"
  | "confirmed"
  | "waitlist"
  | "completed"
  | "cancelled"
  | "spam";
export type PreferredContact =
  | "phone"
  | "email"
  | "telegram"
  | "whatsapp"
  | "any";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Profile = {
  id: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AgeCategory = {
  id: string;
  name: string;
  slug: string;
  age_from: number | null;
  age_to: number | null;
  description: string | null;
  color_token: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Program = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_json: Json;
  cover_path: string | null;
  age_category_id: string | null;
  audience_type: AudienceType;
  format: EventFormat;
  duration_text: string | null;
  price_text: string | null;
  enrollment_status: EnrollmentStatus;
  featured: boolean;
  sort_order: number;
  status: ContentStatus;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Event = {
  id: string;
  program_id: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content_json: Json;
  cover_path: string | null;
  age_category_id: string | null;
  audience_type: AudienceType;
  format: EventFormat;
  starts_at: string;
  ends_at: string;
  timezone: string;
  venue: string | null;
  price_text: string | null;
  capacity: number | null;
  registration_status: RegistrationStatus;
  featured: boolean;
  status: ContentStatus;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type NewsPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_json: Json;
  cover_path: string | null;
  is_pinned: boolean;
  status: ContentStatus;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Album = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_photo_id: string | null;
  event_id: string | null;
  event_date: string | null;
  status: ContentStatus;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type GalleryMediaType = "image" | "video";

export type Photo = {
  id: string;
  album_id: string;
  storage_path: string;
  media_type: GalleryMediaType;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  alt: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type DocumentCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Document = {
  id: string;
  category_id: string | null;
  title: string;
  storage_path: string;
  public_filename: string;
  mime_type: string;
  size_bytes: number;
  document_date: string | null;
  version: string | null;
  sort_order: number;
  status: ContentStatus;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ProgramDocument = {
  program_id: string;
  document_id: string;
  sort_order: number;
  created_at: string;
};

export type MembershipPlan = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  benefits_json: Json;
  price_text: string | null;
  period_text: string | null;
  sort_order: number;
  status: ContentStatus;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Application = {
  id: string;
  type: ApplicationType;
  program_id: string | null;
  event_id: string | null;
  membership_plan_id: string | null;
  parent_name: string;
  phone: string;
  email: string | null;
  child_age_text: string | null;
  age_category_id: string | null;
  preferred_contact: PreferredContact;
  comment: string | null;
  consent_personal_data: boolean;
  consent_marketing: boolean;
  status: ApplicationStatus;
  manager_note: string | null;
  source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  created_at: string;
  updated_at: string;
};

export type TeamMember = {
  id: string;
  full_name: string;
  role_title: string | null;
  bio: string | null;
  photo_path: string | null;
  sort_order: number;
  is_active: boolean;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
};

export type SiteSetting = {
  key: string;
  value_json: Json;
  updated_by: string | null;
  updated_at: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile };
      age_categories: { Row: AgeCategory };
      programs: { Row: Program };
      events: { Row: Event };
      news_posts: { Row: NewsPost };
      albums: { Row: Album };
      photos: { Row: Photo };
      document_categories: { Row: DocumentCategory };
      documents: { Row: Document };
      program_documents: { Row: ProgramDocument };
      membership_plans: { Row: MembershipPlan };
      applications: { Row: Application };
      team_members: { Row: TeamMember };
      site_settings: { Row: SiteSetting };
    };
    Enums: {
      user_role: UserRole;
      content_status: ContentStatus;
      enrollment_status: EnrollmentStatus;
      registration_status: RegistrationStatus;
      audience_type: AudienceType;
      event_format: EventFormat;
      application_type: ApplicationType;
      application_status: ApplicationStatus;
      preferred_contact: PreferredContact;
    };
  };
};
